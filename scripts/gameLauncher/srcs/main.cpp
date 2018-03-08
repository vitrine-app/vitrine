#include "GameLauncher.hh"

using namespace v8;

void launchGame(const FunctionCallbackInfo<Value>& args) {
	GameLauncher gameLauncher(args);
	gameLauncher.parseArgsObject();
	gameLauncher.createProcess();
	gameLauncher.invokeCallback();
}

void init(Local<Object> exports) {
	NODE_SET_METHOD(exports, "launchGame", launchGame);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, init);
