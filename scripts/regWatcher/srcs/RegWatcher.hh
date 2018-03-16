#pragma once

#include <node.h>
#include <uv.h>

struct Worker {
	uv_work_t request;
	v8::Persistent<v8::Function> callback;
	HKEY regNest;
	std::string regKey;
	DWORD startingTimeStamp;
};

static void workAsync(uv_work_t *request);
static void workAsyncComplete(uv_work_t *request, int status);
void watchRegKey(const v8::FunctionCallbackInfo<v8::Value>& args);
void init(v8::Local<v8::Object> exports);
