import * as React from 'react';
import { StyleSheet, css } from 'aphrodite';

import { VitrineComponent } from '../VitrineComponent';

export class MaximizeIcon extends VitrineComponent {
	public constructor(props: any) {
		super(props);
		this.state = {
			color: this.props.colors.color
		};
	}

	private mouseEnterHandler() {
		this.setState({
			color: this.props.colors.hover
		});
	}

	private mouseLeaveHandler() {
		this.setState({
			color: this.props.colors.color
		});
	}

	public render(): JSX.Element {
		return (
			<svg
				width={16}
				height={16}
				className={css(this.props.styles)}
				onClick={this.props.onClick}
				onMouseEnter={this.mouseEnterHandler.bind(this)}
				onMouseLeave={this.mouseLeaveHandler.bind(this)}
			>
				<rect
					className={css(styles.btn)}
					stroke={this.state.color}
					height={12}
					width={12}
					x={2}
					y={2}
					strokeWidth={1.5}
					fill={'none'}
				/>
			</svg>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	btn: {
		transition: `${200}ms ease`
	}
});
