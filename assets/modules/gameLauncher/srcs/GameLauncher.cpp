#include "GameLauncher.hh"

using namespace v8;

static void workAsync(uv_work_t *request) {
	Worker* worker = static_cast<Worker*>(request->data);

	STARTUPINFO startUpInfo;
	PROCESS_INFORMATION processInfo;

	ZeroMemory(&startUpInfo, sizeof(startUpInfo));
	startUpInfo.cb = sizeof(startUpInfo);
	ZeroMemory(&processInfo, sizeof(processInfo));

	worker->startingTimeStamp = GetTickCount();
	if (!CreateProcess(nullptr, const_cast<LPSTR>(worker->commandLine.c_str()), nullptr, nullptr, false, 0, nullptr,
					   (worker->workingDirectory.length()) ? (const_cast<LPSTR>(worker->workingDirectory.c_str())) : (nullptr), &startUpInfo, &processInfo)) {

		Isolate* isolate = Isolate::GetCurrent();
		Local<Value> av[2] = { String::NewFromUtf8(isolate, "Error happened during child process execution."), Undefined(isolate) };
		Local<Function>::New(isolate, worker->callback)->Call(isolate->GetCurrentContext()->Global(), 2, av);
		return;
	}
	WaitForSingleObject(processInfo.hProcess, INFINITE);
	CloseHandle(processInfo.hProcess);
	CloseHandle(processInfo.hThread);
}

static void workAsyncComplete(uv_work_t *request, int status) {
	Isolate* isolate = Isolate::GetCurrent();
	HandleScope handleScope(isolate);
	Worker* worker = static_cast<Worker*>(request->data);

	DWORD timePlayed = (GetTickCount() - worker->startingTimeStamp) / 1000;
	Local<Value> av[2] = { Null(isolate), Number::New(isolate, timePlayed) };

	if (worker->callbackUsed) {
		Local<Function>::New(isolate, worker->callback)->Call(isolate->GetCurrentContext()->Global(), 2, av);
		worker->callback.Reset();
	}
	delete worker;
}

void parseArgsObject(Isolate* isolate, Local<Object> arguments, Worker* worker) {
	Local<String> programFieldName = String::NewFromUtf8(isolate, "program");
	Local<String> argsFieldName = String::NewFromUtf8(isolate, "args");
	Local<String> cwdFieldName = String::NewFromUtf8(isolate, "cwd");

	Local<Value> programField = arguments->Get(programFieldName);
	if (!programField->IsString()) {
		isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "Program must be specified as a string.")));
		return;
	}
	String::Utf8Value filePath(programField->ToString());
	worker->commandLine = std::string(*filePath);

	Local<Value> argsField = arguments->Get(argsFieldName);
	if (argsField->IsString()) {
		String::Utf8Value arg(argsField->ToString());
		worker->commandLine += std::string(" ") + *arg;
	}

	Local<Value> cwdField = arguments->Get(cwdFieldName);
	if (cwdField->IsString()) {
		String::Utf8Value cwd(cwdField->ToString());
		worker->workingDirectory = std::string(*cwd);
	}
	else
		worker->workingDirectory = "";
}

void launchGame(const FunctionCallbackInfo<Value>& args) {
	Isolate* isolate = args.GetIsolate();

	if (!args.Length() || (args.Length() == 1 && !args[0]->IsObject())) {
		isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "You must provide the program as an object.")));
		return;
	}
	else if (args.Length() >= 2 && !args[1]->IsFunction()) {
		isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "The second parameter must be a callback.")));
		return;
	}

	Worker* worker = new Worker();
	worker->request.data = worker;
	parseArgsObject(isolate, Local<Object>::Cast(args[0]), worker);

	if (args.Length() >= 2) {
		Local<Function> callback = Local<Function>::Cast(args[1]);
		worker->callback.Reset(isolate, callback);
		worker->callbackUsed = true;
	}
	else
		worker->callbackUsed = false;

	uv_queue_work(uv_default_loop(), &worker->request, workAsync, workAsyncComplete);
	args.GetReturnValue().Set(Undefined(isolate));
}

void init(Local<Object> exports) {
	NODE_SET_METHOD(exports, "launchGame", launchGame);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, init);
