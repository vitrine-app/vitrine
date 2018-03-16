declare module '*regWatcher.node' {
	export function watchRegKey(regNest: string, regKey: string, callback: (error: string, timePlayed: number) => void): undefined;
}
