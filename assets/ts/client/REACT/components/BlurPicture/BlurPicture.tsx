import * as React from 'react';

import './BlurPicture.scss';
import { urlify } from '../../../helpers';

export class BlurPicture extends React.Component<any, any> {
	private pulseDuration: number;

	public constructor(props: any) {
		super(props);

		let divWidth: number = (this.props.width) ? (this.props.width) : (3.136);
		let divHeight: number = (this.props.height) ? (this.props.height) : (4.48);
		this.pulseDuration = 165;

		this.state = {
			divClassName: '',
			divStyle: {
				width: divWidth + 'em',
				height: divHeight + 'em',
				fontSize: this.props.fontSize + 'px',
				animationDuration: this.pulseDuration + 'ms'
			},
			imageStyle: {
				backgroundImage: urlify(this.props.background)
			},
			iconClassName: '',
			iconStyle: {
				display: 'none',
				animationDuration: '75ms'
			}
		};
	}

	public render() {
		return (
			<div
				className={ 'blur-picture-container ' + this.state.divClassName }
				onMouseEnter={ this.mouseEnterHandler.bind(this) }
				onMouseLeave={ this.mouseLeaveHandler.bind(this) }
				onClick={ this.clickHandler.bind(this) }
				style={ this.state.divStyle }
			>
				<div className="image" style={ this.state.imageStyle }/>
				<i className={'fa fa-' + this.props.faIcon + ' icon ' + this.state.iconClassName } style={ this.state.iconStyle }/>
			</div>
		);
	}

	private mouseEnterHandler() {
		this.setState({
			imageStyle: {
				backgroundImage: urlify(this.props.background),
				filter: 'blur(4px)'
			},
			iconClassName: 'animated zoomIn',
			iconStyle: {
				display: 'inline',
				animationDuration: '75ms'
			}
		});
	}

	private mouseLeaveHandler() {
		this.setState({
			imageStyle: {
				backgroundImage: urlify(this.props.background),
				filter: ''
			},
			iconClassName: 'animated zoomOut',
			iconStyle: {
				display: 'none',
				animationDuration: '75ms'
			}
		});
	}

	private clickHandler() {
		this.setState({
			divClassName: 'animated pulse'
		}, () => {
			setTimeout(() => {
				this.setState({
					divClassName: ''
				});
			}, this.pulseDuration);
		});

		this.props.clickHandler();
	}
}
