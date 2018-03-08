#pragma once

#include <node.h>

class GameLauncher {
public:
	explicit GameLauncher(const v8::FunctionCallbackInfo<v8::Value>& args);
	void parseArgsObject();
	void createProcess();
	void invokeCallback(bool error = false);

private:
	void returnVal(const v8::Local<v8::String>& value);

	v8::Isolate* context;
	const v8::FunctionCallbackInfo<v8::Value>& args;
	std::string commandLine;
	std::string workingDirectory;
};
