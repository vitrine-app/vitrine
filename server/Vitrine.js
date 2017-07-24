const path = require('path');
const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;

class Vitrine {
	constructor() {
		this.windowsList = {};
		this.mainEntryPoint = path.join('file://', __dirname, '..', 'client', 'main.html');
	}

	run() {
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
			height: 600
		});
		this.windowsList.mainWindow.maximize();
		this.windowsList.mainWindow.loadURL(this.mainEntryPoint);
		this.windowsList.mainWindow.setMenu(null);

		this.windowsList.mainWindow.on('closed', () => {
			delete this.windowsList.mainWindow;
		});
	}
}

module.exports = Vitrine;