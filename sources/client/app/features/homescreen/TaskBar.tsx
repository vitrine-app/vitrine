import { css, StyleSheet } from 'aphrodite';
import { BrowserWindow, remote } from 'electron';
import * as React from 'react';

import { WindowControl, WindowControlIcon } from '../../ui/WindowControlIcon';
import { VitrineComponent } from '../VitrineComponent';

export class TaskBar extends VitrineComponent<{}, {}> {
  private currentWindow: BrowserWindow;

  public constructor() {
    super();
    this.currentWindow = remote.getCurrentWindow();

    this.minimizeBtnClickHandler = this.minimizeBtnClickHandler.bind(this);
    this.maximizeBtnClickHandler = this.maximizeBtnClickHandler.bind(this);
    this.closeBtnClickHandler = this.closeBtnClickHandler.bind(this);
  }

  private minimizeBtnClickHandler() {
    this.currentWindow.minimize();
  }

  private maximizeBtnClickHandler() {
    if (this.currentWindow.isMaximized()) {
      this.currentWindow.unmaximize();
    } else {
      this.currentWindow.maximize();
    }
  }

  private closeBtnClickHandler() {
    this.currentWindow.close();
  }

  public render(): JSX.Element {
    return (
      <div className={css(styles.taskBar)}>
        <span className={css(styles.title)}>Vitrine</span>
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
    backgroundColor: '#23211F',
    height: 22,
    textAlign: 'center'
  },
  title: {
    fontSize: 15,
    opacity: 0.6
  },
  windowControlBtnGroup: {
    '-webkitAppRegion': 'no-drag',
    position: 'absolute',
    right: 0,
    top: 0
  }
});
