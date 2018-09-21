import * as React from 'react';

interface State {
	error?: Error;
}

export abstract class VitrineComponent<P, S> extends React.Component<P, S & State> {
	protected modalsTransitionDuration: number;

	protected constructor(props?: P) {
		super(props);

		this.modalsTransitionDuration = 400;
		this.state = {} as any;
	}

	protected throwError(error: Error) {
		this.setState({
			error
		});
	}

	protected checkErrors() {
		if (this.state.error)
			throw this.state.error;
	}

	public render(): React.ReactNode {
		return super.render();
	}
}
