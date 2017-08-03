#include <windows.h>
#include <string>
#include <iostream>

int main(int ac, char **av) {
	if (ac < 2) {
		std::cerr << "Missing game ID parameter." << std::endl;
		return 1;
	}
	std::string gameId = av[1];
	std::string regKey = "Software\\Valve\\Steam\\Apps\\" + gameId;
	HKEY hKey;
	long errorCode;
	DWORD filter = REG_NOTIFY_CHANGE_NAME | REG_NOTIFY_CHANGE_ATTRIBUTES |
			REG_NOTIFY_CHANGE_LAST_SET | REG_NOTIFY_CHANGE_SECURITY;

	errorCode = RegOpenKeyEx(HKEY_CURRENT_USER, regKey.c_str(), 0, KEY_NOTIFY, &hKey);
	if (errorCode != ERROR_SUCCESS) {
		std::cerr << "Error in RegOpenKeyEx (" << errorCode << ")." << std::endl;
		return 1;
	}

	HANDLE event;
	if (!(event = CreateEvent(NULL, true, false, NULL))) {
		std::cerr << "Error in CreateEvent (" << GetLastError() << ")." << std::endl;
		return 1;
	}

	errorCode = RegNotifyChangeKeyValue(hKey, true, filter, event, true);
	if (errorCode) {
		std::cerr << "Error in RegNotifyChangeKeyValue (" << errorCode << ")." << std::endl;
		return 1;
	}
	std::cout << "Waiting for a change in the specified key..." << std::endl;
	if (WaitForSingleObject(event, INFINITE) == WAIT_FAILED) {
		std::cerr << "Error in WaitForSingleObject (" << GetLastError() << ")." << std::endl;
		return 1;
	}
	else
		std::cout << "Changed has occured." << std::endl;

	if (RegCloseKey(hKey) != ERROR_SUCCESS) {
		std::cerr << "Error in RegCloseKey (" << GetLastError() << ")." << std::endl;
		return 1;
	}
	if (!CloseHandle(event))
	{
		std::cerr << "Error in CloseHandle." << std::endl;
		return 1;
	}
	return 0;
}
