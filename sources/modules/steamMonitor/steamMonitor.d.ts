declare module '*steamMonitor.node' {
	export function monitorSteamApp(appId: string, callback: (error: string, timePlayed: number) => void): undefined;
}
