import * as React from 'react';
import { Transition } from 'semantic-ui-react';
import { StyleSheet, css } from 'aphrodite';
import { rgba } from 'css-verbose';
import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';

import { VitrineComponent } from './VitrineComponent';
import { urlify } from '../helpers';

interface Props {
	width?: number,
	height?: number,
	fontSize: number,
	background: string,
	faIcon: IconDefinition,
	clickHandler: () => void
}

interface State {
	iconVisible: boolean,
	pulseVisible: boolean,
	divStyle: React.CSSProperties,
	imageStyle: React.CSSProperties
}

export class BlurPicture extends VitrineComponent<Props, State> {
	private pulseDuration: number;

	public constructor(props: Props) {
		super(props);

		let divWidth: number = this.props.width || 3.136;
		let divHeight: number = this.props.height || 4.48;
		this.pulseDuration = 165;

		this.state = {
			iconVisible: false,
			pulseVisible: true,
			divStyle: {
				width: divWidth.em(),
				height: divHeight.em(),
				fontSize: this.props.fontSize.px(),
				animationDuration: `${this.pulseDuration}ms`
			},
			imageStyle: {
				backgroundImage: urlify(this.props.background)
			}
		};
	}

	private mouseEnterHandler() {
		let imageStyle: any = this.state.imageStyle;
		imageStyle.filter = `blur(${4..px()})`;

		this.setState({
			iconVisible: true,
			imageStyle: {
				backgroundImage: urlify(this.props.background),
				filter: `blur(${4..px()})`
			}
		});
	}

	private mouseLeaveHandler() {
		let imageStyle: any = this.state.imageStyle;
		imageStyle.filter = '';

		this.setState({
			iconVisible: false,
			imageStyle: {
				backgroundImage: urlify(this.props.background),
				filter: ''
			}
		});
	}

	private clickHandler() {
		this.setState({
			pulseVisible: !this.state.pulseVisible
		});

		this.props.clickHandler();
	}

	public componentWillReceiveProps(props: Props) {
		this.setState({
			imageStyle: {
				backgroundImage: urlify(props.background),
				filter: ''
			}
		});
	}

	public render(): JSX.Element {
		return (
			<Transition
				visible={this.state.pulseVisible}
				animation={'pulse'}
				duration={this.pulseDuration}
			>
				<div
					className={css(styles.container)}
					onMouseEnter={this.mouseEnterHandler.bind(this)}
					onMouseLeave={this.mouseLeaveHandler.bind(this)}
					onClick={this.clickHandler.bind(this)}
					style={this.state.divStyle}
				>
					<div className={css(styles.picture)} style={{ ...this.state.imageStyle }}/>
					<Transition
						visible={this.state.iconVisible}
						animation={'scale'}
						duration={75}
					>
						<FontAwesomeIcon
							icon={this.props.faIcon}
							className={css(styles.icon)}
						/>
					</Transition>
					{this.checkErrors()}
				</div>
			</Transition>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	container: {
		width: 100..percents(),
		height: 100..percents(),
		overflow: 'hidden',
		position: 'relative',
		color: '#F1F1F1',
		borderRadius: 4
	},
	picture: {
		width: 100..percents(),
		height: 100..percents(),
		cursor: 'pointer',
		backgroundRepeat: 'no-repeat',
		backgroundSize: `${100..percents()} ${100..percents()}`,
		transition: `${75}ms filter linear`,
		boxShadow: `${0} ${0} ${0} ${2..px()} ${rgba(255, 255, 255, 0.12)} inset`
	},
	icon: {
		position: 'absolute',
		color: rgba(255, 255, 255, 0.6),
		top: 40..percents(),
		left: 40..percents(),
		cursor: 'pointer'
	}
});
