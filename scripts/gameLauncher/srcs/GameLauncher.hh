#pragma once

#include <node.h>
#include <uv.h>

struct Worker {
	uv_work_t request;
	v8::Persistent<v8::Function> callback;
	bool callbackUsed;
	std::string commandLine;
	std::string workingDirectory;
	DWORD startingTimeStamp;
};

static void workAsync(uv_work_t *request);
static void workAsyncComplete(uv_work_t *request, int status);
void parseArgsObject(v8::Isolate* isolate, v8::Local<v8::Object> arguments, Worker* worker);
void launchGame(const v8::FunctionCallbackInfo<v8::Value>& args);
void init(v8::Local<v8::Object> exports);
