#include <node.h>
#include "keys.hh"

using namespace v8;

void getIgdbKey(const FunctionCallbackInfo<Value>& args) {
	args.GetReturnValue().Set(String::NewFromUtf8(Isolate::GetCurrent(), IGDB_KEY));
}

void getSteamKey(const FunctionCallbackInfo<Value>& args) {
	args.GetReturnValue().Set(String::NewFromUtf8(Isolate::GetCurrent(), STEAM_KEY));
}

void init(Local<Object> exports) {
	NODE_SET_METHOD(exports, "igdb", getIgdbKey);
	NODE_SET_METHOD(exports, "steam", getSteamKey);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, init);
