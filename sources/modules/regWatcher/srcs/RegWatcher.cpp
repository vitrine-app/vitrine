#include "RegWatcher.hh"

using namespace v8;

#ifdef _WIN32
static void workAsync(uv_work_t *request) {
	Worker* worker = static_cast<Worker*>(request->data);

	HKEY hKey;
	DWORD filter = REG_NOTIFY_CHANGE_NAME | REG_NOTIFY_CHANGE_ATTRIBUTES | REG_NOTIFY_CHANGE_LAST_SET | REG_NOTIFY_CHANGE_SECURITY;

	if (RegOpenKeyEx(worker->regNest, worker->regKey.c_str(), 0, KEY_NOTIFY, &hKey) != ERROR_SUCCESS) {
		return;
	}

	HANDLE event = CreateEvent(nullptr, true, false, nullptr);
	if (!event) {
		return;
	}

	worker->startingTimeStamp = GetTickCount();
	if (RegNotifyChangeKeyValue(hKey, true, filter, event, true)) {
		return;
	}
	WaitForSingleObject(event, INFINITE);
	RegCloseKey(hKey);
	CloseHandle(event);
}

static void workAsyncComplete(uv_work_t *request, int status) {
	Isolate* isolate = Isolate::GetCurrent();
	HandleScope handleScope(isolate);
	Worker* worker = static_cast<Worker*>(request->data);

	DWORD timePlayed = (GetTickCount() - worker->startingTimeStamp) / 1000;
	Local<Value> av[2] = { Null(isolate), Number::New(isolate, timePlayed) };

	Local<Function>::New(isolate, worker->callback)->Call(isolate->GetCurrentContext()->Global(), 2, av);
	worker->callback.Reset();
	delete worker;
}

void watchRegKey(const FunctionCallbackInfo<Value>& args) {
	Isolate* isolate = args.GetIsolate();

	if (args.Length() < 3 || !args[0]->IsString() || !args[1]->IsString() || !args[2]->IsFunction()) {
		isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "You must provide the registry nest and key as strings.")));
		return;
	}

	Worker* worker = new Worker();
	worker->request.data = worker;

	std::string regNest(*String::Utf8Value(args[0]->ToString()));
	if (regNest == "HKEY_CURRENT_USER")
		worker->regNest = HKEY_CURRENT_USER;
	else if (regNest == "HKEY_CLASSES_ROOT")
		worker->regNest = HKEY_CLASSES_ROOT;
	else if (regNest == "HKEY_LOCAL_MACHINE")
		worker->regNest = HKEY_LOCAL_MACHINE;
	else if (regNest == "HKEY_USERS")
		worker->regNest = HKEY_USERS;
	else if (regNest == "HKEY_CURRENT_CONFIG")
		worker->regNest = HKEY_CURRENT_CONFIG;

	String::Utf8Value regKey(args[1]->ToString());
	worker->regKey = std::string(*regKey);

	Local<Function> callback = Local<Function>::Cast(args[2]);
	worker->callback.Reset(isolate, callback);

	uv_queue_work(uv_default_loop(), &worker->request, workAsync, workAsyncComplete);
	args.GetReturnValue().Set(Undefined(isolate));
}
#else
void watchRegKey(const FunctionCallbackInfo<Value>& args) {
	Isolate* isolate = args.GetIsolate();
	args.GetReturnValue().Set(Undefined(isolate));
}
#endif

void init(Local<Object> exports) {
	NODE_SET_METHOD(exports, "watchRegKey", watchRegKey);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, init);
