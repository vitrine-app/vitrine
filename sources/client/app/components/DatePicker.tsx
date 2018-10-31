import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';
import * as moment from 'moment';
import * as React from 'react';
import * as Datetime from 'react-datetime';
import { Button, Input } from 'semantic-ui-react';

import { VitrineComponent } from './VitrineComponent';

import { faCalendarAlt, faTrash } from '@fortawesome/fontawesome-free-solid';

interface Props {
  value: string | Date | moment.Moment;
  dateFormat: string;
  onChange: (event: any) => void;
  inputProps?: any;
}

export class DatePicker extends VitrineComponent<Props, {}> {
  public constructor() {
    super();

    this.renderInput = this.renderInput.bind(this);
  }

  private static removeDateButtonClick(props: any, openCalendar: () => void) {
    if (props.value)
      props.onChange({
        target: { value: '' }
      });
    else
      openCalendar();
  }

  private renderInput(props: any, openCalendar: () => void): JSX.Element {
    const removeDateButton: JSX.Element = (
      <Button
        secondary={true}
        onClick={DatePicker.removeDateButtonClick.bind(this, props, openCalendar)}
      >
        <FontAwesomeIcon icon={props.value ? faTrash : faCalendarAlt}/>
      </Button>
    );

    return (
      <div>
        <Input
          {...props}
          {...this.props.inputProps}
          label={removeDateButton}
          labelPosition={'right'}
          style={{
            width: 83..percents(),
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
        renderInput={this.renderInput}
      />
    );
  }
}
