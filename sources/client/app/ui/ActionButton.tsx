import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { css, StyleSheet } from 'aphrodite';
import { margin, padding, rgba } from 'css-verbose';
import * as React from 'react';

import * as ReactTooltip from 'react-tooltip';
import { randomHashedString } from '../../../models/env';
import { VitrineComponent } from '../features/VitrineComponent';

interface Props {
  icon: FontAwesomeIcon.IconDefinition;
  spin?: boolean;
  tooltip?: string;
  onClick?: React.MouseEventHandler<any>;
  className?: string;
}

interface State {
  buttonClassName: string;
  iconClassName: string;
}

export class ActionButton extends VitrineComponent<Props, State> {
  private readonly id: string;

  public constructor() {
    super();

    this.state = {
      buttonClassName: css(styles.buttonStandard),
      iconClassName: css(styles.iconStandard)
    };
    this.id = `tooltip_${randomHashedString(6)}`;

    this.mouseEnterHandler = this.mouseEnterHandler.bind(this);
    this.mouseLeaveHandler = this.mouseLeaveHandler.bind(this);
  }

  private mouseEnterHandler() {
    this.setState({
      buttonClassName: css(styles.buttonHover),
      iconClassName: css(styles.iconHover)
    });
  }

  private mouseLeaveHandler() {
    this.setState({
      buttonClassName: css(styles.buttonStandard),
      iconClassName: css(styles.iconStandard)
    });
  }

  public render(): JSX.Element {
    const icon: JSX.Element = (
      <FontAwesomeIcon
        icon={this.props.icon}
        className={`${css(styles.icon)} ${this.state.iconClassName}`}
        spin={this.props.spin}
      />
    );
    const button: JSX.Element = (
      <div
        className={`${css(styles.button)} ${this.state.buttonClassName}`}
        data-tip={true}
        data-for={this.id}
        onMouseEnter={this.mouseEnterHandler}
        onMouseLeave={this.mouseLeaveHandler}
        onClick={this.props.onClick}
      >
        {icon}
      </div>
    );

    return (
      <div className={`${css(styles.buttonWrapper)} ${this.props.className || ''}`}>
        {button}
        {this.props.tooltip ? (
          <ReactTooltip
            className={css(styles.tooltip)}
            id={this.id}
            effect={'solid'}
            place={'bottom'}
            delayShow={500}
          >
            <span>{this.props.tooltip}</span>
          </ReactTooltip>
        ) : ''}
      </div>
    );
  }
}

const styles: React.CSSProperties & any = StyleSheet.create({
  buttonWrapper: {
    display: 'inline-block',
    width: 100..percents(),
    height: 100..percents()
  },
  button: {
    display: 'inline-block',
    width: 84..percents(),
    height: 88..percents(),
    margin: margin(4..percents(), 8..percents()),
    padding: padding(8..percents(), 14..percents()),
    borderRadius: 3,
    cursor: 'pointer',
    transition: `${100}ms ease`,
    '-webkitAppRegion': 'no-drag'
  },
  buttonStandard: {
    backgroundColor: rgba(0, 0, 0, 0),
  },
  buttonHover: {
    backgroundColor: rgba(0, 0, 0, 0.3),
  },
  icon: {
    width: 100..percents(),
    margin: margin(0, 'auto'),
    fontSize: 30,
    textAlign: 'center',
    transition: `${100}ms ease`
  },
  iconStandard: {
    color: '#635F5F',
  },
  iconHover: {
    color: '#908578'
  },
  tooltip: {
    color: '#D4D4D4',
    backgroundColor: rgba(0, 0, 0, 0.85),
    ':after': {
      borderBottomColor: rgba(0, 0, 0, 0.85)
    }
  }
});
