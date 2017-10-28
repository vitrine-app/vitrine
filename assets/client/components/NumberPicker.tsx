import * as React from 'react';
import { css, StyleSheet } from 'aphrodite';

import { VitrineComponent } from './VitrineComponent';

export class NumberPicker extends VitrineComponent {
	public constructor(props: any) {
		super(props);

		this.state = {
			value: (this.props.value) ? (this.props.value) : ('')
		};
	}

	private increaseCounterHandler() {
		let newVal: number;
		let currentVal: number = parseInt(this.state.value);

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
				this.props.onChange(this.state.value);
		});
	}

	private decreaseCounterHandler() {
		let newVal: number;
		let currentVal: number = parseInt(this.state.value);

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
				this.props.onChange(this.state.value);
		});
	}

	private inputChangeHandler(event) {
		let value: any = event.target.value;
		if (isNaN(value))
			return;

		this.setState({
			value: value
		}, () => {
			if (this.props.onChange)
				this.props.onChange(this.state.value);
		});
	}

	public componentWillReceiveProps(props: any) {
		this.setState({
			value: (props.value) ? (props.value) : ('')
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
						<i className={`fa fa-caret-up ${css(styles.verticalBtnIcon)}`}/>
					</button>
					<button
						className={`btn btn-default ${css(styles.verticalBtn)} ${css(styles.lastVerticalBtn)}`}
						type="button"
						onClick={this.decreaseCounterHandler.bind(this)}
					>
						<i className={`fa fa-caret-down ${css(styles.verticalBtnIcon)}`}/>
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
		width: `${1}%`,
		verticalAlign: 'middle',
		display: 'table-cell'
	},
	verticalBtn: {
		display: 'block',
		float: 'none',
		width: `${100}%`,
		maxWidth: `${100}%`,
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
