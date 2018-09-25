/* tslint:disable:no-var-requires */
const steamMonitor = require('../../modules/steamMonitor');

export function monitorSteamApp(appId: string, callback: (error: string, timePlayed: number) => void) {
	return steamMonitor.monitorSteamApp(appId, callback);
}
