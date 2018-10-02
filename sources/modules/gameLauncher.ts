/* tslint:disable:no-var-requires */
const steamMonitor = require('../../modules/gameLauncher');

export interface GameLauncherOptions {
  program: string;
  args?: string;
  cwd?: string;
}

export function launchGame(file: GameLauncherOptions, callback?: (error: string, timePlayed: number) => void) {
  return steamMonitor.monitorSteamApp(file, callback);
}
