import * as path from 'path';
import { app, BrowserWindow, ipcMain } from 'electron';

export class Vitrine {
	private windowsList;
	private mainEntryPoint: string;
	private devTools: boolean;

	constructor() {
		this.windowsList = {};
		this.mainEntryPoint = path.join('file://', __dirname, 'public', 'main.html');
		this.devTools = false;
	}

	public run(devTools?: boolean) {
		if (devTools)
			this.devTools = devTools;
		app.on('ready', this.createMainWindow.bind(this));
		app.on('window-all-closed', () => {
			if (process.platform !== 'darwin') {
				app.quit();
			}
		});
		app.on('activate', () => {
			if (this.windowsList.mainWindow === null) {
				this.createMainWindow();
			}
		});

	}

	public registerEvents(events: object) {
		Object.keys(events).forEach((name) => {
			ipcMain.on(name, events[name]);
		});
	}

	private createMainWindow() {
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
