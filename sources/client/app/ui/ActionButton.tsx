import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { css, StyleSheet } from 'aphrodite';
import { margin, padding, rgba } from 'css-verbose';
import * as React from 'react';
import * as ReactTooltip from 'react-tooltip';

import { randomHashedString } from '@models/env';
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
      <FontAwesomeIcon icon={this.props.icon} className={`${css(styles.icon)} ${this.state.iconClassName}`} spin={this.props.spin} />
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
          <ReactTooltip className={css(styles.tooltip)} id={this.id} effect={'solid'} place={'bottom'} delayShow={500}>
            <span>{this.props.tooltip}</span>
          </ReactTooltip>
        ) : (
          ''
        )}
      </div>
    );
  }
}

const styles: React.CSSProperties & any = StyleSheet.create({
  button: {
    '-webkitAppRegion': 'no-drag',
    borderRadius: 3,
    cursor: 'pointer',
    display: 'inline-block',
    height: (88).percents(),
    margin: margin((4).percents(), (8).percents()),
    padding: padding((8).percents(), (14).percents()),
    transition: `${100}ms ease`,
    width: (84).percents()
  },
  buttonHover: {
    backgroundColor: rgba(0, 0, 0, 0.3)
  },
  buttonStandard: {
    backgroundColor: rgba(0, 0, 0, 0)
  },
  buttonWrapper: {
    display: 'inline-block',
    height: (100).percents(),
    width: (100).percents()
  },
  icon: {
    fontSize: 30,
    margin: margin(0, 'auto'),
    textAlign: 'center',
    transition: `${100}ms ease`,
    width: (100).percents()
  },
  iconHover: {
    color: '#908578'
  },
  iconStandard: {
    color: '#635F5F'
  },
  tooltip: {
    ':after': {
      borderBottomColor: rgba(0, 0, 0, 0.85)
    },
    backgroundColor: rgba(0, 0, 0, 0.85),
    color: '#D4D4D4'
  }
});
