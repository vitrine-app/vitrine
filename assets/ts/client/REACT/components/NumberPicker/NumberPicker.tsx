import * as React from 'react';

import './NumberPicker.scss';

export class NumberPicker extends React.Component<any, any> {
	public constructor(props: any) {
		super(props);

		this.state = {
			value: (this.props.value) ? (this.props.value) : ('')
		};
	}

	public render() {
		return (
			<div className="input-group spinner">
				<input
					type="text"
					className="form-control"
					name={ this.props.name }
					placeholder={ this.props.placeholder }
					value={ this.state.value }
					onChange={ this.inputChangeHandler.bind(this) }
				/>
				<div className="input-group-btn-vertical">
					<button
						className="btn btn-default"
						type="button"
						onClick={ this.increaseCounterHandler.bind(this) }
					>
						<i className="fa fa-caret-up"/>
					</button>
					<button
						className="btn btn-default"
						type="button"
						onClick={ this.decreaseCounterHandler.bind(this) }
					>
						<i className="fa fa-caret-down"/>
					</button>
				</div>
			</div>
		);
	}

	private increaseCounterHandler() {
		let newVal: number;
		let currentVal: number = parseInt(this.state.value);

		if (currentVal || currentVal === 0) {
			if (currentVal < this.props.max)
				newVal = currentVal + 1;
			else
				newVal = this.props.max;
		}
		else
			newVal = this.props.min;

		this.setState({
			value: newVal
		}, () => {
			this.props.onChange(this.state.value);
		});
	}
	private decreaseCounterHandler() {
		let newVal: number;
		let currentVal: number = parseInt(this.state.value);

		if (currentVal || currentVal === 0) {
			if (currentVal >= this.props.min)
				newVal = currentVal - 1;
			else
				newVal = this.props.min;
		}
		else
			newVal = this.props.min;

		this.setState({
			value: newVal
		}, () => {
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
			this.props.onChange(this.state.value);
		});
	}
}
