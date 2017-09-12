import * as React from 'react';

import './NumberPicker.scss';

export class NumberPicker extends React.Component<any, any> {
	public constructor(props: any) {
		super(props);

		this.state = {
			value: ''
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
		let newValue: number;
		if (!isNaN(this.state.value)) {
			if (this.state.value < this.props.max)
				newValue = parseInt(this.state.value) + 1;
			else
				return;
		}
		else
			newValue = this.props.min;
		this.setState({
			value: newValue
		}, () => {
			this.props.onChange(this.state.value);
		});

	}
	private decreaseCounterHandler() {
		let newValue: number;
		if (!isNaN(this.state.value)) {
			if (this.state.value > this.props.min)
				newValue = parseInt(this.state.value) - 1;
			else
				return;
		}
		else
			newValue = this.props.min;
		this.setState({
			value: newValue
		}, () => {
			this.props.onChange(this.state.value);
		});
	}

	private inputChangeHandler() {
		this.props.onChange(this.state.value);
	}
}
