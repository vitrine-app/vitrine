import { css, StyleSheet } from 'aphrodite';
import { rgba } from 'css-verbose';
import * as React from 'react';

import { CloseSvg } from './CloseSvg';
import { MaximizeSvg } from './MaximizeSvg';
import { MinimizeSvg } from './MinimizeSvg';

export enum WindowControl {
  MinimizeIcon,
  MaximizeIcon,
  CloseIcon
}

interface Props {
  icon: WindowControl;
  onClick: React.MouseEventHandler<any>;
  redBackground?: boolean;
}

interface State {
  hovered: boolean;
}

export class WindowControlIcon extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = {
      hovered: false
    };

    this.mouseEnterHandler = this.mouseEnterHandler.bind(this);
    this.mouseLeaveHandler = this.mouseLeaveHandler.bind(this);
  }

  private mouseEnterHandler() {
    this.setState({
      hovered: true
    });
  }

  private mouseLeaveHandler() {
    this.setState({
      hovered: false
    });
  }

  private iconRender(): JSX.Element {
    switch (this.props.icon) {
      case WindowControl.MinimizeIcon:
        return <MinimizeSvg hovered={this.state.hovered}/>;
      case WindowControl.MaximizeIcon:
        return <MaximizeSvg hovered={this.state.hovered}/>;
      case WindowControl.CloseIcon:
        return <CloseSvg hovered={this.state.hovered}/>;
    }
  }

  public render(): JSX.Element {
    return (
      <div
        onMouseEnter={this.mouseEnterHandler}
        onMouseLeave={this.mouseLeaveHandler}
        className={css(styles.icon, (this.props.redBackground) ? (styles.redIcon) : (styles.regularIcon))}
        onClick={this.props.onClick}
      >
        {this.iconRender()}
      </div>
    );
  }
}

const styles: React.CSSProperties & any = StyleSheet.create({
  icon: {
    backgroundColor: rgba(0, 0, 255, 0),
    width: 40,
    height: 22,
    paddingTop: 2,
    textAlign: 'center',
    cursor: 'pointer',
    display: 'inline-block',
    transition: `${70}ms ease`
  },
  regularIcon: {
    ':hover': {
      backgroundColor: rgba(255, 255, 255, 0.06)
    }
  },
  redIcon: {
    ':hover': {
      backgroundColor: rgba(138, 48, 48, 1)
    }
  }
});
