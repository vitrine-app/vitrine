import { ipcRenderer } from 'electron';

class ServerListener {
	public constructor(private emitterName: string, private receiverName: string) {}

	public send(channelName, ...args) {
		const sentArgs: any[] = [
			`${this.emitterName}.${channelName}`,
			...args
		];
		ipcRenderer.send.apply(ipcRenderer, sentArgs);
	}

	public listen(channelName: string, callbackFunction: (...args: any[]) => any): this {
		ipcRenderer.on(`${this.receiverName}.${channelName}`, (...args) => {
			args.shift();
			callbackFunction.apply(null, args);
		});
		return this;
	}
}

export let loaderServerListener: ServerListener = new ServerListener('loader', 'loaderServer');
export let serverListener: ServerListener = new ServerListener('client', 'server');
