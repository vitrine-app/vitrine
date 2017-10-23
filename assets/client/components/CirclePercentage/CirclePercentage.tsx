import * as React from 'react';

import { VitrineComponent } from '../VitrineComponent';

import './CirclePercentage.scss';

export class CirclePercentage extends VitrineComponent {
	public constructor(props: any) {
		super(props);
	}

	public render(): JSX.Element {
		return (
			<svg viewBox="0 0 36 36" className="circular-percentage">
				<path
					className="circular-percentage-circle"
					d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
					strokeDasharray={`${this.props.percentage}, 100`}
				/>
				<text
					x="10"
					y="22.35"
					className="percentage-text">
					{this.props.percentage}
				</text>
			</svg>
		);
	}
}
