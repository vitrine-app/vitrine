import { css, StyleSheet } from 'aphrodite';
import { rgba } from 'css-verbose';
import { BrowserWindow, remote } from 'electron';
import * as React from 'react';

import { WindowControl, WindowControlIcon } from '../../ui/WindowControlIcon';
import { VitrineComponent } from '../VitrineComponent';

export class InvisibleTaskBar extends VitrineComponent<{}, {}> {
  private currentWindow: BrowserWindow;

  public constructor() {
    super();
    this.currentWindow = remote.getCurrentWindow();
  }

  private minimizeBtnClickHandler = () => {
    this.currentWindow.minimize();
  };

  private maximizeBtnClickHandler = () => {
    if (this.currentWindow.isMaximized()) {
      this.currentWindow.unmaximize();
    } else {
      this.currentWindow.maximize();
    }
  };

  private closeBtnClickHandler = () => {
    this.currentWindow.close();
  };

  public render(): JSX.Element {
    return (
      <div className={css(styles.taskBar)}>
        <div className={css(styles.windowControlBtnGroup)}>
          <WindowControlIcon icon={WindowControl.MinimizeIcon} onClick={this.minimizeBtnClickHandler} />
          <WindowControlIcon icon={WindowControl.MaximizeIcon} onClick={this.maximizeBtnClickHandler} />
          <WindowControlIcon icon={WindowControl.CloseIcon} redBackground={true} onClick={this.closeBtnClickHandler} />
        </div>
        {this.checkErrors()}
      </div>
    );
  }
}

const styles: React.CSSProperties & any = StyleSheet.create({
  taskBar: {
    '-webkitAppRegion': 'drag',
    backgroundColor: rgba(0, 0, 0, 0),
    height: 30,
    position: 'absolute',
    width: (100).vw(),
    zIndex: 1
  },
  windowControlBtnGroup: {
    '-webkitAppRegion': 'no-drag',
    position: 'absolute',
    right: 0,
    top: 0
  }
});
