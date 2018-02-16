import * as React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { margin, rgba } from 'css-verbose';
import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';

import { PlayableGame } from '../../../models/PlayableGame';
import { VitrineComponent } from './VitrineComponent';
import { urlify } from '../helpers';

import { faTv } from '@fortawesome/fontawesome-free-solid';

interface Props {
	launchedGame: PlayableGame
	clickHandler: Function
}

export class LaunchedGameContainer extends VitrineComponent<Props, {}> {
	public render(): JSX.Element {
		return (
			<div>
				<FontAwesomeIcon
					icon={faTv}
					className={css(styles.toggleDisplayIcon)}
					onClick={this.props.clickHandler}
				/>
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
		backgroundSize: 100..percents()
	},
	'85%': {
		backgroundSize: 120..percents()
	},
	'100%': {
		backgroundSize: 120..percents()
	}
};

const styles: React.CSSProperties = StyleSheet.create({
	launchedGameDiv: {
		textAlign: 'center',
		marginTop: 28..vh()
	},
	toggleDisplayIcon: {
		display: 'block',
		fontSize: 27,
		textAlign: 'right',
		paddingRight: 10,
		paddingTop: 10,
		cursor: 'pointer',
		opacity: 0.5,
		':hover': {
			opacity: 0.8
		}
	},
	launchedGameTitle: {
		fontSize: 50,
		color: rgba(255, 255, 255, 0.7)
	},
	launchedGameHr: {
		margin: margin(10, 40..vw()),
		borderColor: rgba(255, 255, 255, 0.45),
	},
	launchedGameSubTitle: {
		fontSize: 25,
		color: rgba(255, 255, 255, 0.7)
	},
	launchedGameBackground: {
		position: 'absolute',
		zIndex: -1,
		width: 100..percents(),
		height: 100..percents(),
		top: 0,
		left: 0,
		opacity: 0.8,
		backgroundRepeat: 'no-repeat',
		backgroundPosition: 'center',
		filter: `blur(${8..px()})`,
		animationName: backgroundKeyframes,
		animationDuration: `${20}s`,
		animationTimingFunction: 'ease-in-out',
		animationIterationCount: 'infinite',
		animationDirection: 'alternate'
	}
});
