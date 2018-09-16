#pragma once

#include <iostream>
#include <node.h>
#include <uv.h>

unsigned int getTickTime() {
#ifdef _WIN32
	return GetTickCount();
#else
	timespec now;
	if (clock_gettime(CLOCK_MONOTONIC, &now))
		return 1;
	return static_cast<unsigned int>(now.tv_sec * 1000);
#endif
}

#ifdef _WIN32
struct Worker {
	uv_work_t request;
	v8::Persistent<v8::Function> callback;
	bool callbackUsed;
	std::string commandLine;
	std::string args;
	std::string workingDirectory;
	unsigned int startingTimeStamp;
};

static void workAsync(uv_work_t *request);
static void workAsyncComplete(uv_work_t *request, int status);
void parseArgsObject(v8::Isolate* isolate, v8::Local<v8::Object> arguments, Worker* worker);
#endif
void launchGame(const v8::FunctionCallbackInfo<v8::Value>& args);
void init(v8::Local<v8::Object> exports);
