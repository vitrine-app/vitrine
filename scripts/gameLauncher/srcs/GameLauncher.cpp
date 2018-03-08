#include <windows.h>
#include "GameLauncher.hh"

using namespace v8;

GameLauncher::GameLauncher(const FunctionCallbackInfo<Value>& args) : args(args) {
	this->context = this->args.GetIsolate();

	if (args.Length() < 2 || !this->args[0]->IsObject() || !this->args[1]->IsFunction())
		this->context->ThrowException(Exception::TypeError(String::NewFromUtf8(this->context, "You must provide the program and its arguments as an object.")));
}

void GameLauncher::parseArgsObject() {
	Local<Object> arguments = Local<Object>::Cast(this->args[0]);
	Local<String> programFieldName = String::NewFromUtf8(this->context, "program");
	Local<String> argsFieldName = String::NewFromUtf8(this->context, "args");
	Local<String> cwdFieldName = String::NewFromUtf8(this->context, "cwd");

	Local<Value> programField = arguments->Get(programFieldName);
	if (!programField->IsString()) {
		this->context->ThrowException(Exception::TypeError(String::NewFromUtf8(this->context, "Program must be specified as a string.")));
		return;
	}
	String::Utf8Value filePath(programField->ToString());
	this->commandLine = std::string(*filePath);

	Local<Value> argsField = arguments->Get(argsFieldName);
	if (argsField->IsString()) {
		String::Utf8Value arg(argsField->ToString());
		this->commandLine += std::string(" ") + *arg;
	}

	Local<Value> cwdField = arguments->Get(cwdFieldName);
	if (cwdField->IsString()) {
		String::Utf8Value cwd(cwdField->ToString());
		this->workingDirectory = std::string(*cwd);
	}
	else
		this->workingDirectory = nullptr;

	this->returnVal(String::NewFromUtf8(this->context, this->commandLine.c_str()));
}

void GameLauncher::createProcess() {
   	STARTUPINFO si;
    PROCESS_INFORMATION pi;

    ZeroMemory(&si, sizeof(si));
    si.cb = sizeof(si);
   	ZeroMemory(&pi, sizeof(pi));

   	if (!CreateProcess(nullptr,const_cast<LPSTR>(this->commandLine.c_str()), nullptr, nullptr, false, 0, nullptr,
					   const_cast<LPSTR>(this->workingDirectory.c_str()), &si, &pi)) {
		return;
   	}
   	WaitForSingleObject(pi.hProcess, INFINITE);
   	CloseHandle(pi.hProcess);
    CloseHandle(pi.hThread);
}


void GameLauncher::invokeCallback(bool error) {
	Local<Function> callback = Local<Function>::Cast(this->args[1]);
	const unsigned int ac = 1;
	std::string errorStr = "An error occured during the child process creation.";
	Local<Value> av[ac] = { String::NewFromUtf8(this->context, (error) ? (errorStr.c_str()) : ("")) };
	callback->Call(Null(this->context), ac, av);
}

void GameLauncher::returnVal(const Local<String>& value) {
	this->args.GetReturnValue().Set(value);
}
