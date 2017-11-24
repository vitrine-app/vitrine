import * as React from 'react';
import { ReactNode } from 'react';

export abstract class VitrineComponent extends React.Component<any, any> {
	public constructor(props?: any) {
		super(props);
		this.state = {};
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

	public render(): ReactNode {
		return super.render();
	}
}
