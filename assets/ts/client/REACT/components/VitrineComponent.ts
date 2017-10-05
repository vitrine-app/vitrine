import * as React from 'react';

export abstract class VitrineComponent extends React.Component<any, any> {
	public constructor(props?: any) {
		super(props);
		this.state = {};
	}

	protected throwError(message: String | Error) {
		let currentState: any = Object.assign({}, this.state);
		currentState.error = new Error(<string>message);

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
