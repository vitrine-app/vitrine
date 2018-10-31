#pragma once

#include <node.h>
#include <uv.h>
#include <unistd.h>
#include <sys/inotify.h>
#include <time.h>

#define EVENT_SIZE (sizeof(struct inotify_event))
#define BUFFER_LENGTH (1024 * (EVENT_SIZE + 16))
#define STEAM_REGISTRY_PATH "/.steam/registry.vdf"

struct AppWorker {
  uv_work_t request;
  v8::Persistent<v8::Function> callback;
  std::string steamRegistryPath;
  unsigned int startingTimestamp;
};

void monitorGameChange(uv_work_t *request);
void monitorGameStart(uv_work_t *request, int status);
void monitorInterStep(uv_work_t *request, int status);
void monitorGameEnd(uv_work_t *request, int status);
void monitorSteamApp(const v8::FunctionCallbackInfo<v8::Value>& args);
void init(v8::Local<v8::Object> exports);
