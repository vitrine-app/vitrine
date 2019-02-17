/* tslint:disable:no-var-requires */
const steamMonitor = require('../../modules/gameLauncher');

export interface GameLauncherOptions {
  program: string;
  args?: string;
  cwd?: string;
}

export function launchGame(file: GameLauncherOptions): Promise<number> {
  return new Promise((resolve, reject) => {
    steamMonitor.launchGame(file, (error: string, secondsPlayed: number) => {
      if (error) {
        reject(new Error(error));
      } else {
        resolve(secondsPlayed);
      }
    });
  });
}
