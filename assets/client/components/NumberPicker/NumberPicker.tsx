import * as React from 'react';

import { VitrineComponent } from '../VitrineComponent';

import './NumberPicker.scss';

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
				{ this.checkErrors() }
			</div>
		);
	}
}
