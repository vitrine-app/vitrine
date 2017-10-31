import * as React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { rgba } from 'css-verbose';

import { VitrineComponent } from './VitrineComponent';
import { urlify } from '../helpers';

export class LaunchedGameContainer extends VitrineComponent {
	public constructor(props: any) {
		super(props);
	}

	public render(): JSX.Element {
		return (
			<div>
				<div className={css(styles.launchedGameDiv)}>
					<span className={css(styles.launchedGameTitle)}>Vous êtes en train de jouer à {this.props.launchedGame.name}.</span>
					<hr className={css(styles.launchedGameHr)}/>
					<span className={css(styles.launchedGameSubTitle)}>Amusez-vous bien !</span>
				</div>
				<div
					className={css(styles.launchedGameBackground)}
					style={{ backgroundImage: urlify(this.props.launchedGame.details.backgroundScreen) }}
				/>
			</div>
		);
	}
}

const backgroundKeyframes: React.CSSProperties = {
	'0%': {
		width: `${99}%`,
		transform: `scale(${1.02})`
	},
	'100%': {
		width: `${92}%`,
		transform: `scale(${1.15})`
	}
};

const styles: React.CSSProperties = StyleSheet.create({
	launchedGameDiv: {
		textAlign: 'center',
		marginTop: `${29}vh`
	},
	launchedGameTitle: {
		fontSize: 50,
		color: '#FFFFFF'
	},
	launchedGameHr: {
		margin: `${10}px ${40}vw`,
		borderColor: rgba(255, 255, 255, 0.45),
	},
	launchedGameSubTitle: {
		fontSize: 25,
		color: rgba(255, 255, 255, 0.7)
	},
	launchedGameBackground: {
		position: 'absolute',
		zIndex: -1,
		height: `${100}%`,
		top: 0,
		left: 0,
		opacity: 0.8,
		backgroundRepeat: 'no-repeat',
		backgroundSize: 'cover',
		filter: `blur(${10}px)`,
		animationName: backgroundKeyframes,
		animationDuration: `${20}s`,
		animationTimingFunction: 'linear',
		animationIterationCount: 'infinite',
		animationDirection: 'alternate'
	}
});
