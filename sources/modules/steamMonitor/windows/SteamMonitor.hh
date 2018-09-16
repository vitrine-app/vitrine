#pragma once

#include <node.h>
#include <uv.h>

#define STEAM_REGISTRY_KEY "Software\\Valve\\Steam\\Apps\\"

struct AppWorker {
	uv_work_t request;
	v8::Persistent<v8::Function> callback;
	std::string steamRegistryKey;
	DWORD startingTimestamp;
};

void monitorGameChange(uv_work_t *request);
void monitorGameStart(uv_work_t *request, int status);
void monitorGameEnd(uv_work_t *request, int status);
void monitorSteamApp(const v8::FunctionCallbackInfo<v8::Value>& args);
void init(v8::Local<v8::Object> exports);
