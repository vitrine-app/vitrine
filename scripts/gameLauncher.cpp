#include <string>
#include <iostream>
#include <process.h>
#include <errno.h>
#include <string.h>

int main(int ac, char **av) {
	if (ac < 2) {
		std::cerr << "Missing parameters." << std::endl;
		return 1;
	}
	std::string commandLine = av[1];
	std::string args = "";

	for (int i = 1; i < ac; ++i) {
		if (i == 1)
			args = "\"" + std::string(av[i]) + "\"";
		else
			args += std::string(av[i]);
		if (i != ac - 1)
			args += " ";

	}
	std::cout << args << std::endl;
	system(args.c_str());
	return 0;
}
