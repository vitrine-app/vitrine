import * as React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { padding, rgba } from 'css-verbose';
import * as FontAwesomeIcon from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-common-types';

import { VitrineComponent } from './VitrineComponent';
import * as ReactTooltip from 'react-tooltip';
import { randomHashedString } from '../../server/helpers';

interface Props {
	icon: IconDefinition,
	spin?: boolean,
	tooltip?: string,
	onClick?: React.MouseEventHandler<any> | string
}

interface State {
	buttonClassName: string,
	iconClassName: string
}

export class Button extends VitrineComponent<Props, State> {
	private id: string;

	public constructor() {
		super();

		this.state = {
			buttonClassName: css(styles.buttonStandard),
			iconClassName: css(styles.iconStandard)
		};
		this.id = `tooltip_${randomHashedString(6)}`;
	}

	private mouseEnterHandler() {
		this.setState({
			buttonClassName: css(styles.buttonHover),
			iconClassName: css(styles.iconHover)
		});
	}

	private mouseLeaveHandler() {
		this.setState({
			buttonClassName: css(styles.buttonStandard),
			iconClassName: css(styles.iconStandard)
		});
	}

	public render(): JSX.Element {
		let icon: JSX.Element = <FontAwesomeIcon
			icon={this.props.icon}
			className={`${css(styles.icon)} ${this.state.iconClassName}`}
			spin={this.props.spin}
		/>;
		let button: JSX.Element = (this.props.onClick instanceof Function) ? (
			<div
				className={`${css(styles.button)} ${this.state.buttonClassName}`}
				data-tip
				data-for={this.id}
				onMouseEnter={this.mouseEnterHandler.bind(this)}
				onMouseLeave={this.mouseLeaveHandler.bind(this)}
				onClick={this.props.onClick}
			>{icon}</div>
		) : (
			<div
				className={`${css(styles.button)} ${this.state.buttonClassName}`}
				data-tip
				data-for={this.id}
				data-toggle={'modal'}
				data-target={this.props.onClick}
				onMouseEnter={this.mouseEnterHandler.bind(this)}
				onMouseLeave={this.mouseLeaveHandler.bind(this)}
			>{icon}</div>
		);

		return (
			<div>
				{button}
				{(this.props.tooltip) ? (
					<ReactTooltip
						className={css(styles.tooltip)}
						id={this.id}
						effect={'solid'}
						place={'bottom'}
						delayShow={500}
					>
						<span>{this.props.tooltip}</span>
					</ReactTooltip>
				) : ('')}
			</div>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	button: {
		display: 'inline-block',
		padding: padding(5, 8, 4, 8),
		borderRadius: 3,
		cursor: 'pointer',
		transition: `${100}ms ease`,
		'-webkitAppRegion': 'no-drag'
	},
	buttonStandard: {
		backgroundColor: rgba(0, 0, 0, 0),
	},
	buttonHover: {
		backgroundColor: rgba(0, 0, 0, 0.3),
	},
	icon: {
		fontSize: 30,
		textAlign: 'center',
		transition: `${100}ms ease`
	},
	iconStandard: {
		color: '#635F5F',
	},
	iconHover: {
		color: '#908578'
	},
	tooltip: {
		color: '#D4D4D4',
		backgroundColor: rgba(0, 0, 0, 0.85),
		':after': {
			borderBottomColor: rgba(0, 0, 0, 0.85)
		}
	}
});
