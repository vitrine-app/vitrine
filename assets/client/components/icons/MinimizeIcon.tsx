import * as React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { rgba } from 'css-verbose';

import { VitrineComponent } from '../VitrineComponent';

export class MinimizeIcon extends VitrineComponent {
	private colorStyles: any;

	public constructor(props: any) {
		super(props);
		this.colorStyles = {
			color: rgba(255, 255, 255, 0.3),
			hover: rgba(255, 255, 255, 0.6)
		};
		this.state = {
			color: this.colorStyles.color
		};
	}

	private mouseEnterHandler() {
		this.setState({
			color: this.colorStyles.hover
		});
	}

	private mouseLeaveHandler() {
		this.setState({
			color: this.colorStyles.color
		});
	}

	public render(): JSX.Element {
		return (
			<svg
				width={16}
				height={16}
				className={css(styles.windowControlIcon)}
				onClick={this.props.onClick}
				onMouseEnter={this.mouseEnterHandler.bind(this)}
				onMouseLeave={this.mouseLeaveHandler.bind(this)}
			>
				<line
					className={css(styles.btn)}
					stroke={this.state.color}
					x1={1}
					x2={15}
					y1={12}
					y2={12}
					strokeWidth={1.5}
				/>
			</svg>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	btn: {
		transition: `${200}ms ease`
	},
	windowControlIcon: {
		cursor: 'pointer',
		marginLeft: 14,
		'-webkitAppRegion': 'no-drag'
	}
});
