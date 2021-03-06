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
  }

  private handleMouse = (hovered: boolean) => () => {
    this.setState({
      hovered
    });
  };

  private iconRender = () => {
    switch (this.props.icon) {
      case WindowControl.MinimizeIcon:
        return <MinimizeSvg hovered={this.state.hovered} />;
      case WindowControl.MaximizeIcon:
        return <MaximizeSvg hovered={this.state.hovered} />;
      case WindowControl.CloseIcon:
        return <CloseSvg hovered={this.state.hovered} />;
    }
  };

  public render(): JSX.Element {
    return (
      <div
        onMouseEnter={this.handleMouse(true)}
        onMouseLeave={this.handleMouse(false)}
        className={css(styles.icon, this.props.redBackground ? styles.redIcon : styles.regularIcon)}
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
    cursor: 'pointer',
    display: 'inline-block',
    height: 35,
    paddingTop: 10,
    textAlign: 'center',
    transition: `${70}ms ease`,
    width: 45
  },
  redIcon: {
    ':hover': {
      backgroundColor: rgba(255, 82, 82, 0.11)
    }
  },
  regularIcon: {
    ':hover': {
      backgroundColor: rgba(255, 255, 255, 0.03)
    }
  }
});
