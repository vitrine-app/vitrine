import * as React from 'react';

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

	public render(): JSX.Element | JSX.Element[] | React.ReactPortal | string | number | null | false {
		return super.render();
	}
}
