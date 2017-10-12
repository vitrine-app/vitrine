import * as React from 'react';

import { VitrineComponent } from '../VitrineComponent';

import './GamesModule.scss';

export class GamesModule extends VitrineComponent {
	public constructor(props: any) {
		super(props);

		this.state = {
			clicked: false
		};
	}

	private imgClickHandler() {
		this.setState({
			clicked: !this.state.clicked
		}, () => {
			this.props.clickHandler(this.state.clicked);
		});
	}

	public render(): JSX.Element {
		return (
			<img
				alt={ this.props.iconAlt }
				src={ this.props.iconFile }
				className={ 'games-module-icon' + ((this.state.clicked) ? (' clicked') : (''))}
				onClick={ this.imgClickHandler.bind(this) }
			/>
		);
	}
}
