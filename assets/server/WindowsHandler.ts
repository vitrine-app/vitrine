import { app, BrowserWindow, ipcMain, Menu, Tray } from 'electron';
import { EventEmitter } from 'events';
import * as path from 'path';

import { isProduction } from '../models/env';
import { logger } from './Logger';

export class WindowsHandler {
	private readonly clientEntryPoint: string;
	private readonly loaderEntryPoint: string;
	private readonly iconPath: string;
	private loaderWindow: BrowserWindow;
	private clientWindow: BrowserWindow;
	private tray: Tray;
	private appQuit: boolean;

	public constructor() {
		this.clientEntryPoint = path.resolve('file://', __dirname, 'client.html');
		this.loaderEntryPoint = path.resolve('file://', __dirname, 'loader.html');
		this.iconPath = path.resolve(__dirname, 'img', 'vitrine.ico');
		this.appQuit = false;
	}

	public run() {
		if (app.makeSingleInstance(this.restoreAndFocus.bind(this))) {
			this.quitApplication();
			return;
		}
		if (app.isReady())
			this.createLoaderWindow();
		else
			app.on('ready', this.createLoaderWindow.bind(this));
		app.on('window-all-closed', () => {
			if (process.platform !== 'darwin') {
				this.quitApplication();
			}
		});
		app.on('activate', () => {
			if (!this.clientWindow) {
				this.createClientWindow();
			}
		});
	}

	public clientReady() {
		this.createTrayIcon();
		this.loaderWindow.destroy();
		this.clientWindow.show();
	}

	public createLoaderWindow() {
		logger.info('WindowsHandler', 'Creating loader window.');
		this.loaderWindow = new BrowserWindow({
			height: 300,
			width: 500,
			icon: this.iconPath,
			frame: false,
			resizable: false
		});
		this.loaderWindow.loadURL(this.loaderEntryPoint);
		logger.info('WindowsHandler', 'Loader window created.');
	}

	public createClientWindow() {
		logger.info('WindowsHandler', 'Creating main client window.');
		this.clientWindow = new BrowserWindow({
			minWidth: 1450,
			minHeight: 700,
			icon: this.iconPath,
			show: false,
			frame: false,
			width: 1650,
			height: 900
		});
		this.clientWindow.setMenu(null);
		this.clientWindow.maximize();
		this.clientWindow.loadURL(this.clientEntryPoint);
		this.clientWindow.hide();
		if (!isProduction())
			this.clientWindow.webContents.openDevTools();

		this.clientWindow.on('close', (event: Event) => {
			if (!this.appQuit) {
				event.preventDefault();
				this.clientWindow.hide();
			}
			else
				delete this.clientWindow;
		});
		logger.info('WindowsHandler', 'Main client window created.');
	}

	public quitApplication(mustRelaunch?: boolean) {
		if (mustRelaunch) {
			logger.info('WindowsHandler', 'Relaunching Vitrine.');
			app.relaunch();
		}
		else
			logger.info('WindowsHandler', 'Quitting Vitrine.');

		this.appQuit = true;
		if (this.tray)
			this.tray.destroy();
		app.quit();
	}

	public sendToLoader(channelName, ...args) {
		const sentArgs: any[] = [
			`loaderServer.${channelName}`,
			...args
		];
		this.loaderWindow.webContents.send.apply(this.loaderWindow.webContents, sentArgs);
	}

	public sendToClient(channelName, ...args) {
		const sentArgs: any[] = [
			`server.${channelName}`,
			...args
		];
		this.clientWindow.webContents.send.apply(this.clientWindow.webContents, sentArgs);
	}

	public listenToLoader(channelName: string, callbackFunction: (...args: any[]) => void): this {
		ipcMain.on(`loader.${channelName}`, (...args) => {
			args.shift();
			callbackFunction.apply(null, args);
		});
		return this;
	}

	public listenToClient(channelName: string, callbackFunction: (...args: any[]) => void): this {
		ipcMain.on(`client.${channelName}`, (...args) => {
			args.shift();
			callbackFunction.apply(null, args);
		});
		return this;
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
				click: this.quitApplication.bind(this, false)
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
