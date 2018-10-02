/// <reference types="react-datetime"/>

import { Component } from 'react';
import { DatetimepickerProps, DatetimepickerState } from '../../../node_modules/react-datetime/DateTime';

export = ReactDatetimeClass;

declare namespace ReactDatetimeClass {}

interface CustomProps {
  renderInput?: (props: any, openCalendar: () => void, closeCalendar: () => void) => void;
}

declare class ReactDatetimeClass extends Component<DatetimepickerProps & CustomProps, DatetimepickerState> {}
