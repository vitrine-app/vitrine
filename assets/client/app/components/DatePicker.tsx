import * as React from 'react';
import * as Datetime from '@paul-roman/react-date-time-input';
import { Button, Input } from 'semantic-ui-react';
import * as moment from 'moment';
import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';

import { VitrineComponent } from './VitrineComponent';

import { faTrash } from '@fortawesome/fontawesome-free-solid';

interface Props {
	value: Date | string | moment.Moment,
	dateFormat: string,
	onChange: (event: any) => void,
	inputProps?: any
}

export class DatePicker extends VitrineComponent<Props, {}> {
	private renderInput(props: any): JSX.Element {
		const removeDateButton: JSX.Element = (
			<Button
				secondary={true}
				onClick={() => props.onChange({ target: { value: '' } })}
			>
				<FontAwesomeIcon icon={faTrash}/>
			</Button>
		);

		return (
			<div>
				<Input
					{...props}
					{...this.props.inputProps}
					label={(this.props.value) ? (removeDateButton) : (null)}
					labelPosition={(this.props.value) ? ('right') : (null)}
					style={{
						width: (this.props.value) ? (83..percents()) : (100..percents()),
						cursor: 'text'
					}}
				/>
			</div>
		);
	}

	public render(): JSX.Element {
		return (
			<Datetime
				value={this.props.value}
				dateFormat={this.props.dateFormat}
				timeFormat={false}
				onChange={this.props.onChange}
				renderInput={this.renderInput.bind(this)}
			/>
		);
	}
}
