import { css, StyleSheet } from 'aphrodite';
import { margin, rgba } from 'css-verbose';
import * as React from 'react';

import { VitrineComponent } from './VitrineComponent';

import * as lessVars from 'less-vars-loader?camelCase&resolveVariables!../../resources/less/theme/globals/site.variables';

interface Props {
  percentage: number;
  color: string;
}

export class CirclePercentage extends VitrineComponent<Props, {}> {
  public constructor(props: Props) {
    super(props);
  }

  public render(): JSX.Element {
    return (
      <svg viewBox={'0 0 36 36'} className={css(styles.svg)}>
        <path
          className={css(styles.backgroundCircle)}
          d={'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'}
          strokeDasharray={`100, 100`}
        />
        <path
          className={css(styles.circle)}
          d={'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'}
          strokeDasharray={`${this.props.percentage}, 100`}
          style={{ stroke: this.props.color }}
        />
        <text
          x={9}
          y={21}
          className={css(styles.text)}
        >
          {this.props.percentage}
        </text>
        <text
          x={14}
          y={28}
          className={css(styles.backgroundText)}
        >
          / 100
        </text>
        {this.checkErrors()}
      </svg>
    );
  }
}

const progressKeyframe: React.CSSProperties & any = {
  '0%': {
    strokeDasharray: '0 100'
  }
};

const styles: React.CSSProperties & any = StyleSheet.create({
  svg: {
    display: 'block',
    height: 110,
    width: 110,
    margin: margin(10, 'auto')
  },
  circle: {
    fill: 'none',
    strokeWidth: 2.8,
    strokeLinecap: 'round',
    animationName: progressKeyframe,
    animation: '500ms ease-out forwards'
  },
  backgroundCircle: {
    stroke: rgba(0, 0, 0, 0.3),
    fill: 'none',
    strokeWidth: 2.8,
    strokeLinecap: 'round',
    animationName: progressKeyframe,
    animation: '500ms ease-out forwards'
  },
  text: {
    fill: lessVars.textColor,
    fontSize: 13
  },
  backgroundText: {
    fill: rgba(213, 213, 213, 0.4),
    fontSize: 5
  }
});
