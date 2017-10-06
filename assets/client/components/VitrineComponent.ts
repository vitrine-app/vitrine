import * as React from 'react';

export abstract class VitrineComponent extends React.Component<any, any> {
	public constructor(props?: any) {
		super(props);
		this.state = {};
	}

	protected throwError(error: string | Error) {
		let currentState: any = Object.assign({}, this.state);
		let message: string = (error instanceof Error) ? (error.message) : (error);
		currentState.error = new Error(message);

		this.setState(currentState);
	}

	protected checkErrors() {
		if (this.state.error)
			throw this.state.error;
	}

	public render(): JSX.Element | false | null {
		return super.render();
	}
}
