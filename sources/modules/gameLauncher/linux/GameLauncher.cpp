#include "GameLauncher.hh"

using namespace v8;

static void monitorGameStart(uv_work_t *request) {
	Worker* worker = static_cast<Worker*>(request->data);
	std::string cmd;
	if (worker->workingDirectory.length() > 0) {
		cmd += "cd ";
		cmd += worker->workingDirectory + " && ";
	}
	cmd += worker->commandLine + " ";
	cmd += worker->args;

	worker->startingTimeStamp = static_cast<unsigned int>(time(nullptr));
	system(cmd.c_str());
}

static void monitorGameEnd(uv_work_t *request, int status) {
	Isolate* isolate = Isolate::GetCurrent();
	HandleScope handleScope(isolate);
	Worker* worker = static_cast<Worker*>(request->data);

	unsigned int timePlayed = (static_cast<unsigned int>(time(nullptr))- worker->startingTimeStamp);
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
		worker->args = std::string(*arg);
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

	uv_queue_work(uv_default_loop(), &worker->request, monitorGameStart, monitorGameEnd);
	args.GetReturnValue().Set(Undefined(isolate));
}


void init(Local<Object> exports) {
	NODE_SET_METHOD(exports, "launchGame", launchGame);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, init);
