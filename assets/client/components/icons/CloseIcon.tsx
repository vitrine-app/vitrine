import * as React from 'react';
import { StyleSheet, css } from 'aphrodite';

import { VitrineComponent } from '../VitrineComponent';

export class CloseIcon extends VitrineComponent {
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
				<line
					className={css(styles.btn)}
					stroke={this.state.color}
					x1={1}
					x2={15}
					y1={1}
					y2={15}
					strokeWidth={1.5}
				/>
				<line
					className={css(styles.btn)}
					stroke={this.state.color}
					x1={15}
					x2={1}
					y1={1}
					y2={15}
					strokeWidth={1.5}
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
