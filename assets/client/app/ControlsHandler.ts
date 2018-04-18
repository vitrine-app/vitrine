import { GamepadListener, ListenerEvent } from 'gamepad-listener';

interface ActionCallbacks {
	[key: string]: () => void;
}

class ControlsHandler {
	private actionCallbacks: ActionCallbacks;
	private gamepadListener: GamepadListener;

	public constructor() {
		this.gamepadListener = new GamepadListener();
		this.actionCallbacks = {};
		window.addEventListener('keydown', this.registerKeyboardActions.bind(this));
		this.registerGamepadActions();
		this.gamepadListener.start();
	}

	public unregister() {
		window.removeEventListener('keydown', this.registerKeyboardActions.bind(this));
		this.gamepadListener.stop();
	}

	public registerDownAction(callback: () => void) {
		this.actionCallbacks.down = callback;
	}

	public registerUpAction(callback: () => void) {
		this.actionCallbacks.up = callback;
	}

	private registerKeyboardActions(event: KeyboardEvent) {
		event.preventDefault();
		switch (event.code) {
			case 'ArrowUp': {
				if (this.actionCallbacks.up)
					this.actionCallbacks.up();
				break;
			}
			case 'ArrowDown': {
				if (this.actionCallbacks.down)
					this.actionCallbacks.down();
				break;
			}
		}
	}

	private registerGamepadActions() {
		this.gamepadListener.on('gamepad:axis', (event: ListenerEvent) => {
			if (event.axis === 1) {
				if (event.value < -0.98 && this.actionCallbacks.up)
					this.actionCallbacks.up();
				if (event.value > 0.96 && this.actionCallbacks.down)
					this.actionCallbacks.down();
			}
		});
	}
}

export const controlsHandler: ControlsHandler = new ControlsHandler();
