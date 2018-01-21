import { app, BrowserWindow, Menu, screen, Tray } from 'electron';
import * as path from "path";

export class WindowsHandler {
	private loaderWindow: BrowserWindow;
	private clientWindow: BrowserWindow;
	private mainEntryPoint: string;
	private loaderEntryPoint: string;
	private tray: Tray;
	private devTools: boolean;
	private iconPath: string;
	private appQuit: boolean;

	public constructor() {
		this.mainEntryPoint = path.resolve('file://', __dirname, 'main.html');
		this.loaderEntryPoint = path.resolve('file://', __dirname, 'loader.html');
		this.iconPath = path.resolve(__dirname, 'img', 'vitrine.ico');
		this.appQuit = false;
	}

	public run(devTools?: boolean) {
		this.devTools = devTools;
		if (app.makeSingleInstance(this.restoreAndFocus.bind(this))) {
			this.quitApplication();
			return;
		}
		app.on('ready', this.createLoaderWindow.bind(this));
		app.on('window-all-closed', () => {
			if (process.platform !== 'darwin')
				this.quitApplication();
		});
		app.on('activate', () => {
			if (!this.clientWindow)
				this.createMainWindow();
		});
	}

	public clientReady() {
		this.createTrayIcon();
		this.loaderWindow.destroy();
		this.clientWindow.show();
	}

	public createLoaderWindow() {
		this.loaderWindow = new BrowserWindow({
			height: 300,
			width: 500,
			icon: this.iconPath,
			frame: false
		});
		this.loaderWindow.loadURL(this.loaderEntryPoint);
		if (this.devTools)
			this.loaderWindow.webContents.openDevTools();
	}

	public createMainWindow() {
		if (!screen)
			return;
		const { width, height } = screen.getPrimaryDisplay().workAreaSize;
		this.clientWindow = new BrowserWindow({
			minWidth: width,
			minHeight: height,
			icon: this.iconPath,
			show: false,
			frame: false,
			width,
			height
		});
		this.clientWindow.setMenu(null);
		this.clientWindow.maximize();
		this.clientWindow.loadURL(this.mainEntryPoint);
		this.clientWindow.hide();
		if (this.devTools)
			this.clientWindow.webContents.openDevTools();

		this.clientWindow.on('close', (event: Event) => {
			if (!this.appQuit) {
				event.preventDefault();
				this.clientWindow.hide();
			}
			else
				delete this.clientWindow;
		});
	}

	public quitApplication(mustRelaunch?: boolean) {
		if (mustRelaunch)
			app.relaunch();
		this.appQuit = true;
		if (this.tray)
			this.tray.destroy();
		app.quit();
	}

	private createTrayIcon() {
		this.tray = new Tray(this.iconPath);
		this.tray.setTitle('Vitrine');
		this.tray.setToolTip('Vitrine');
		this.tray.setContextMenu(Menu.buildFromTemplate([
			{
				label: 'Show',
				type: 'normal',
				click: this.restoreAndFocus.bind(this)
			},
			{
				label: 'Quit',
				type: 'normal',
				click: this.quitApplication.bind(this)
			}
		]));
		this.tray.on('double-click', this.restoreAndFocus.bind(this));
	}

	private restoreAndFocus() {
		if (this.clientWindow) {
			this.clientWindow.show();
			if (this.clientWindow.isMinimized())
				this.clientWindow.restore();
			this.clientWindow.focus();
		}
	}
}
