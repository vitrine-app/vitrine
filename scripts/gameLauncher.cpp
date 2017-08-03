#include <string>
#include <iostream>

int main(int ac, char **av) {
	if (ac < 2) {
		std::cerr << "Missing parameters." << std::endl;
		return 1;
	}
	std::string parameters = "";
	for (int i = 1; i < ac; ++i) {
		parameters += av[i];
		if (i != ac - 1)
			parameters += " ";
	}
	system(parameters.c_str());
	return 0;
}
