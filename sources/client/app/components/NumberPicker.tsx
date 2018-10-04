import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { css, StyleSheet } from 'aphrodite';
import { padding } from 'css-verbose';
import * as React from 'react';
import { Button, Input } from 'semantic-ui-react';

import { VitrineComponent } from './VitrineComponent';

import { faCaretDown, faCaretUp } from '@fortawesome/fontawesome-free-solid';

interface Props {
  min: number;
  max: number;
  name: string;
  placeholder: string;
  value: number;
  onChange?: (value: number) => void;
}

interface State {
  value: string | React.ReactText;
}

export class NumberPicker extends VitrineComponent<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = {
      value: (this.props.value !== undefined) ? (this.props.value) : ('')
    };

    this.increaseCounterHandler = this.increaseCounterHandler.bind(this);
    this.decreaseCounterHandler = this.decreaseCounterHandler.bind(this);
    this.inputChangeHandler = this.inputChangeHandler.bind(this);
  }

  private increaseCounterHandler() {
    let newVal: number;
    const currentVal: number = parseInt(this.state.value as string);

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
    const currentVal: number = parseInt(this.state.value as string);

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
        this.props.onChange(this.state.value as number);
    });
  }

  public static getDerivedStateFromProps(nextProps: Props): Partial<State> {
    return {
      value: (nextProps.value !== undefined) ? (nextProps.value) : ('')
    };
  }

  public render(): JSX.Element {
    const controlButtons: JSX.Element = (
      <div className={css(styles.verticalBtnDiv)}>
        <Button
          secondary={true}
          className={css(styles.verticalBtn, styles.firstVerticalBtn)}
          onClick={this.increaseCounterHandler}
        >
          <FontAwesomeIcon icon={faCaretUp}/>
        </Button>
        <Button
          secondary={true}
          className={css(styles.verticalBtn, styles.lastVerticalBtn)}
          onClick={this.decreaseCounterHandler}
        >
          <FontAwesomeIcon icon={faCaretDown}/>
        </Button>
      </div>
    );

    return (
      <div>
        <Input
          label={controlButtons}
          labelPosition={'right'}
          type={'text'}
          size={'large'}
          className={css(styles.spinnerInput)}
          name={this.props.name}
          placeholder={this.props.placeholder}
          value={this.state.value}
          onChange={this.inputChangeHandler}
        />
        {this.checkErrors()}
      </div>
    );
  }
}

const styles: React.CSSProperties & any = StyleSheet.create({
  spinnerInput: {
    textAlign: 'right'
  },
  verticalBtnDiv: {
    padding: 0
  },
  verticalBtn: {
    display: 'block',
    width: 25,
    height: 22,
    padding: padding(3, 8, 8, 8),
    marginLeft: -1,
    borderRadius: 0
  },
  firstVerticalBtn: {
    borderTopRightRadius: 4
  },
  lastVerticalBtn: {
    borderBottomRightRadius: 4
  }
});
