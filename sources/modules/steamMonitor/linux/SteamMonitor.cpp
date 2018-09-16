#include "SteamMonitor.hh"

using namespace v8;

void monitorGameChange(uv_work_t *request) {
	int fd = inotify_init();
	if (fd < 0)
		return;

	AppWorker* worker = static_cast<AppWorker*>(request->data);
	int wd = inotify_add_watch(fd, worker->steamRegistryPath.c_str(), IN_MODIFY);

	char buffer[BUFFER_LENGTH];
	ssize_t length = read(fd, buffer, BUFFER_LENGTH);
	if (length < 0) {
		inotify_rm_watch(fd, wd);
		close(fd);
		return;
	}
	inotify_rm_watch(fd, wd);
	close(fd);
}

void monitorGameStart(uv_work_t *request, int status) {
	Isolate* isolate = Isolate::GetCurrent();
	HandleScope handleScope(isolate);
	AppWorker* worker = static_cast<AppWorker*>(request->data);
	worker->startingTimestamp = static_cast<unsigned int>(time(nullptr));
	uv_queue_work(uv_default_loop(), &worker->request, monitorGameChange, monitorInterStep);
}

void monitorInterStep(uv_work_t *request, int status) {
	AppWorker* worker = static_cast<AppWorker*>(request->data);
	uv_queue_work(uv_default_loop(), &worker->request, monitorGameChange, monitorGameEnd);
}

void monitorGameEnd(uv_work_t *request, int status) {
	Isolate* isolate = Isolate::GetCurrent();
	HandleScope handleScope(isolate);
	AppWorker* worker = static_cast<AppWorker*>(request->data);
	unsigned int timePlayed = static_cast<unsigned int>(time(nullptr)) - worker->startingTimestamp;
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

	passwd *pw = getpwuid(getuid());
	const char *homeDir = pw->pw_dir;
	worker->steamRegistryPath = std::string(homeDir) + STEAM_REGISTRY_PATH;

	uv_queue_work(uv_default_loop(), &worker->request, monitorGameChange, monitorGameStart);
	args.GetReturnValue().Set(Undefined(isolate));
}

void init(Local<Object> exports) {
	NODE_SET_METHOD(exports, "monitorSteamApp", monitorSteamApp);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, init);
