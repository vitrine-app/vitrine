const path = require('path');
const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;

class Vitrine {
	constructor() {
		this.windowsList = {};
		this.mainEntryPoint = path.join('file://', __dirname, '..', 'public', 'main.html');
		this.devTools = false;
	}

	run(devTools) {
		if (devTools)
			this.devTools = devTools;
		app.on('ready', this._createMainWindow.bind(this));
		app.on('window-all-closed', () => {
			if (process.platform !== 'darwin') {
				app.quit();
			}
		});
		app.on('activate', () => {
			if (this.windowsList.mainWindow === null) {
				this._createMainWindow();
			}
		});

	}

	registerEvents(events) {
		if (typeof events !== 'object')
			return null;
		Object.keys(events).forEach((name) => {
			ipcMain.on(name, events[name]);
		});
	}

	_createMainWindow() {
		this.windowsList.mainWindow = new BrowserWindow({
			width: 800,
			height: 600,
			minWidth: 800,
			minHeight: 500
		});
		this.windowsList.mainWindow.setMenu(null);
		this.windowsList.mainWindow.maximize();
		this.windowsList.mainWindow.loadURL(this.mainEntryPoint);
		if (this.devTools)
			this.windowsList.mainWindow.webContents.openDevTools();

		this.windowsList.mainWindow.on('closed', () => {
			delete this.windowsList.mainWindow;
		});
	}
}

module.exports = Vitrine;