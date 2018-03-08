declare module '*gameLauncher.node' {
	interface GameLauncherOptions {
		program: string;
		args?: string;
	}

	export function launchGame(file: GameLauncherOptions, callback: () => void): any;
}
