@echo off
set scripts=(gameLauncher regWatcher)
set electron_version=1.8.2
set electron_url=https://atom.io/download/electron

cd scripts
for %%i in %scripts% do (
	cd %%i
	node-gyp rebuild --target=%electron_version% --arch=x64 --dist-url=%electron_url%
	move build\Release\%%i.node ..\%%i.node
	cd ..
)
