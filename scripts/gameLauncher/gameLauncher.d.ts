declare module '*gameLauncher.node' {
	interface GameLauncherOptions {
		program: string;
		args?: string;
		cwd?: string
	}

	export function launchGame(file: GameLauncherOptions, callback: () => void): any;
}
