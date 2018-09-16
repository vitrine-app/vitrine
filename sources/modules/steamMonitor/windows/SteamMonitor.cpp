#include "SteamMonitor.hh"

using namespace v8;

void monitorGameChange(uv_work_t *request) {
	AppWorker* worker = static_cast<AppWorker*>(request->data);

	HKEY hKey;
	DWORD filter = REG_NOTIFY_CHANGE_NAME | REG_NOTIFY_CHANGE_ATTRIBUTES | REG_NOTIFY_CHANGE_LAST_SET | REG_NOTIFY_CHANGE_SECURITY;

	if (RegOpenKeyEx(HKEY_CURRENT_USER, worker->steamRegistryKey.c_str(), 0, KEY_NOTIFY, &hKey) != ERROR_SUCCESS)
		return;

	HANDLE event = CreateEvent(nullptr, true, false, nullptr);
	if (!event)
		return;

	if (RegNotifyChangeKeyValue(hKey, true, filter, event, true))
		return;
	WaitForSingleObject(event, INFINITE);
	RegCloseKey(hKey);
	CloseHandle(event);
}

void monitorGameStart(uv_work_t *request, int status) {
	Isolate* isolate = Isolate::GetCurrent();
	HandleScope handleScope(isolate);
	AppWorker* worker = static_cast<AppWorker*>(request->data);
	worker->startingTimestamp = GetTickCount()
	uv_queue_work(uv_default_loop(), &worker->request, monitorGameChange, monitorGameEnd);
}

void monitorGameEnd(uv_work_t *request, int status) {
	Isolate* isolate = Isolate::GetCurrent();
	HandleScope handleScope(isolate);
	AppWorker* worker = static_cast<AppWorker*>(request->data);
	DWORD timePlayed = (GetTickCount() - worker->startingTimestamp) / 1000;
	Local<Value> av[2] = { Null(isolate), Number::New(isolate, timePlayed) };

	Local<Function>::New(isolate, worker->callback)->Call(isolate->GetCurrentContext()->Global(), 2, av);
	worker->callback.Reset();
	delete worker;
}

void monitorSteamApp(const FunctionCallbackInfo<Value>& args) {
	Isolate* isolate = args.GetIsolate();

	if (args.Length() < 2 || !args[0]->IsString() || !args[1]->IsFunction()) {
		isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "You must provide the Steam app ID as string and callback.")));
		return;
	}

	AppWorker* worker = new AppWorker();
	worker->request.data = worker;
	worker->callback.Reset(isolate, Local<Function>::Cast(args[1]));

	String::Utf8Value appId(args[0]->ToString());
	worker->steamRegistryKey = std::string(STEAM_REGISTRY_KEY) + std::string(*appId);

	uv_queue_work(uv_default_loop(), &worker->request, monitorGameChange, monitorGameStart);
	args.GetReturnValue().Set(Undefined(isolate));
}

void init(Local<Object> exports) {
	NODE_SET_METHOD(exports, "monitorSteamApp", monitorSteamApp);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, init);
