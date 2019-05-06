import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';
import * as moment from 'moment';
import * as React from 'react';
import * as Datetime from 'react-datetime';
import { Button, Input } from 'semantic-ui-react';

import { VitrineComponent } from '../../features/VitrineComponent';

import { faCalendarAlt, faTrash } from '@fortawesome/fontawesome-free-solid';

interface Props {
  value: string | Date | moment.Moment;
  dateFormat: string;
  onChange: (event: any) => void;
  inputProps?: any;
}

export class DatePicker extends VitrineComponent<Props & any, {}> {
  private removeDateButtonClick = (props: any, openCalendar: () => void) => () => {
    if (props.value) {
      props.onChange({
        target: { value: '' }
      });
    } else {
      openCalendar();
    }
  };

  private renderInput = (props: any, openCalendar: () => void) => {
    const removeDateButton: JSX.Element = (
      <Button secondary={true} onClick={this.removeDateButtonClick(props, openCalendar)}>
        <FontAwesomeIcon icon={props.value ? faTrash : faCalendarAlt} />
      </Button>
    );
    return (
      <div>
        <Input
          {...props}
          {...this.props.inputProps}
          label={removeDateButton}
          labelPosition={'right'}
          size={'small'}
          style={{
            cursor: 'text',
            fontSize: 14,
            width: (83).percents()
          }}
        />
      </div>
    );
  };

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
