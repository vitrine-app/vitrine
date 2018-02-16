import * as React from 'react';
import { css, StyleSheet } from 'aphrodite';
import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';

import { VitrineComponent } from './VitrineComponent';

import { faCaretUp, faCaretDown } from '@fortawesome/fontawesome-free-solid';

interface Props {
	min: number,
	max: number,
	name: string,
	placeholder: string
	value: number,
	onChange?: Function
}

interface State {
	value: string | React.ReactText
}

export class NumberPicker extends VitrineComponent<Props, State> {
	public constructor(props: Props) {
		super(props);

		this.state = {
			value: (this.props.value !== undefined) ? (this.props.value) : ('')
		};
	}

	private increaseCounterHandler() {
		let newVal: number;
		let currentVal: number = parseInt(this.state.value as string);

		if (isNaN(currentVal) || currentVal < this.props.min)
			newVal = this.props.min;
		else if (currentVal >= this.props.max)
			newVal = this.props.max;
		else
			newVal = currentVal + 1;

		this.setState({
			value: newVal
		}, () => {
			if (this.props.onChange)
				this.props.onChange(parseInt(this.state.value as string));
		});
	}

	private decreaseCounterHandler() {
		let newVal: number;
		let currentVal: number = parseInt(this.state.value as string);

		if (isNaN(currentVal) || currentVal <= this.props.min)
			newVal = this.props.min;
		else if (currentVal > this.props.max)
			newVal = this.props.max;
		else
			newVal = currentVal - 1;

		this.setState({
			value: newVal
		}, () => {
			if (this.props.onChange)
				this.props.onChange(parseInt(this.state.value as string));
		});
	}

	private inputChangeHandler(event) {
		let value: number = parseInt(event.target.value);
		if (isNaN(value))
			value = this.props.min;

		this.setState({
			value
		}, () => {
			if (this.props.onChange)
				this.props.onChange(this.state.value);
		});
	}

	public componentWillReceiveProps(props: Props) {
		this.setState({
			value: (props.value !== undefined) ? (props.value) : ('')
		});
	}

	public render(): JSX.Element {
		return (
			<div className="input-group spinner">
				<input
					type="text"
					className={`form-control ${css(styles.spinnerInput)}`}
					name={this.props.name}
					placeholder={this.props.placeholder}
					value={this.state.value}
					onChange={this.inputChangeHandler.bind(this)}
				/>
				<div className={css(styles.verticalBtnDiv)}>
					<button
						className={`btn btn-default ${css(styles.verticalBtn)} ${css(styles.firstVerticalBtn)}`}
						type="button"
						onClick={this.increaseCounterHandler.bind(this)}
					>
						<FontAwesomeIcon
							icon={faCaretUp}
							className={css(styles.verticalBtnIcon)}
						/>
					</button>
					<button
						className={`btn btn-default ${css(styles.verticalBtn)} ${css(styles.lastVerticalBtn)}`}
						type="button"
						onClick={this.decreaseCounterHandler.bind(this)}
					>
						<FontAwesomeIcon
							icon={faCaretDown}
							className={css(styles.verticalBtnIcon)}
						/>
					</button>
				</div>
				{this.checkErrors()}
			</div>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	spinnerInput: {
		textAlign: 'right'
	},
	verticalBtnDiv: {
		position: 'relative',
		whiteSpace: 'nowrap',
		width: 1..percents(),
		verticalAlign: 'middle',
		display: 'table-cell'
	},
	verticalBtn: {
		display: 'block',
		float: 'none',
		width: 100..percents(),
		maxWidth: 100..percents(),
		padding: 8,
		marginLeft: -1,
		position: 'relative',
		borderRadius: 0
	},
	firstVerticalBtn: {
		borderTopRightRadius: 4
	},
	lastVerticalBtn: {
		marginTop: 2,
		borderBottomRightRadius: 4
	},
	verticalBtnIcon: {
		position: 'absolute',
		top: 0,
		left: 4
	}
});