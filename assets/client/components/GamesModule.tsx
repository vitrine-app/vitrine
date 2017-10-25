import * as React from 'react';
import { StyleSheet, css } from 'aphrodite';

import { VitrineComponent } from './VitrineComponent';

import * as bootstrapVariables from '!!sass-variable-loader!../sass/bootstrap.variables.scss';

export class GamesModule extends VitrineComponent {
	public constructor(props: any) {
		super(props);

		this.state = {
			clicked: this.props.clicked
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
			<div>
				<img
					alt={this.props.iconAlt}
					src={this.props.iconFile}
					className={
						css(styles.gamesModuleIcon) + ' ' +
						(((this.state.clicked) ? (css(styles.clickedGamesModuleIcon)) : ('')))
					}
					onClick={this.imgClickHandler.bind(this)}
				/>
				{this.checkErrors()}
			</div>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	gamesModuleIcon: {
		opacity: 0.05,
		width: 150 + 'px',
		margin: 15 + 'px',
		transition: 320 + 'ms ease',
		':hover': {
			opacity: 0.14,
			cursor: 'pointer'
		}
	},
	clickedGamesModuleIcon: {
		opacity: 1,
		filter: `opacity(0.5) drop-shadow(0 0 0 ${bootstrapVariables.brandPrimary})`
	}
});
