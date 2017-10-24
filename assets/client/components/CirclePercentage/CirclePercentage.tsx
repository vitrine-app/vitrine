import * as React from 'react';
import { StyleSheet, css } from 'aphrodite';

import { VitrineComponent } from '../VitrineComponent';

import * as bootstrapVariables from '!!sass-variable-loader!../../sass/bootstrap.variables.scss';

export class CirclePercentage extends VitrineComponent {
	public constructor(props: any) {
		super(props);
	}

	public render(): JSX.Element {
		return (
			<svg viewBox="0 0 36 36" className={css(styles.svg)}>
				<path
					className={css(styles.circle)}
					d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
					strokeDasharray={`${this.props.percentage}, 100`}
				/>
				<text
					x="10"
					y="22.35"
					className={css(styles.text)}
				>
					{this.props.percentage}
				</text>
			</svg>
		);
	}
}

const progressKeyframe: React.CSSProperties = {
	'0%': {
		strokeDasharray: '0 100'
	}
};

const styles: React.CSSProperties = StyleSheet.create({
	svg: {
		display: 'block',
		height: 110,
		width: 110,
		marginTop: 10,
		marginBottom: 10,
		marginLeft: 'auto',
		marginRight: 'auto'
	},
	circle: {
		stroke: bootstrapVariables.brandPrimary,
		fill: 'none',
		strokeWidth: 2.8,
		strokeLinecap: 'round',
		animationName: progressKeyframe,
		animation: '500ms ease-out forwards'
	},
	text: {
		fill: bootstrapVariables.textColor,
		fontSize: 13
	}
});
