#!/bin/bash
# Get Electron current version from package.json and build every Node native module based on the directories name.

electron_url=https://atom.io/download/electron
electron_version=$(cat ../package.json | grep '"electron":' | sed -E 's/[ ]+"electron": "[\^]?(.*)"[,]?/\1/')

mkdir -p ../modules
cd ../assets/modules

dirs=( $(find . -maxdepth 1 -type d -printf '%P\n') )
echo "${#dirs[@]} Node native module(s) are about to be built."

for dir in "${dirs[@]}"; do
	echo "Building ${dir}..."
	cd $dir
	../../../node_modules/.bin/node-gyp rebuild --target=$electron_version --arch=x64 --dist-url=$electron_url
	mv build/Release/$dir.node ../../../modules
	rm -R build
	cd ..
	echo "${dir} built completed!"
done
