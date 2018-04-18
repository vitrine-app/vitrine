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

	public registerEnterAction(callback: () => void) {
		this.actionCallbacks.enter = callback;
	}

	private registerKeyboardActions(event: KeyboardEvent) {
		switch (event.code) {
			case 'ArrowUp': {
				event.preventDefault();
				if (this.actionCallbacks.up)
					this.actionCallbacks.up();
				break;
			}
			case 'ArrowDown': {
				event.preventDefault();
				if (this.actionCallbacks.down)
					this.actionCallbacks.down();
				break;
			}
			case 'Enter': {
				event.preventDefault();
				if (this.actionCallbacks.enter)
					this.actionCallbacks.enter();
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
		this.gamepadListener.on('gamepad:button:0', (event: ListenerEvent) => {
			if (event.button.pressed && this.actionCallbacks.enter)
				this.actionCallbacks.enter();
		});
	}
}

export const controlsHandler: ControlsHandler = new ControlsHandler();
