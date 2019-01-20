import { css, StyleSheet } from 'aphrodite';
import { margin, padding, rgba } from 'css-verbose';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Modal } from 'semantic-ui-react';

import { serverListener } from '../serverListener';

interface State {
  visible: boolean;
  error?: Error;
}

export class ErrorsWrapper extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);

    this.state = {
      visible: false
    };
  }

  private static quitApplication() {
    serverListener.send('quit-application', false);
  }

  private static relaunchApplication() {
    serverListener.send('quit-application', true);
  }

  public componentDidCatch(error: Error) {
    this.setState({
      error,
      visible: true
    });
  }

  public render(): JSX.Element {
    if (this.state.error) {
      return (
        <Modal open={this.state.visible} className={css(styles.modal)}>
          <Modal.Header>
            <FormattedMessage id={'crash'} />
          </Modal.Header>
          <Modal.Content>
            <span className={css(styles.errorIcon)}>:(</span>
            <pre className={css(styles.errorStack)}>{this.state.error.stack}</pre>
          </Modal.Content>
          <Modal.Actions>
            <Button secondary={true} onClick={ErrorsWrapper.quitApplication}>
              <FormattedMessage id={'actions.quit'} />
            </Button>
            <Button secondary={true} onClick={ErrorsWrapper.relaunchApplication}>
              <FormattedMessage id={'actions.relaunch'} />
            </Button>
          </Modal.Actions>
        </Modal>
      );
    } else {
      return this.props.children as JSX.Element;
    }
  }
}

const styles: React.CSSProperties & any = StyleSheet.create({
  errorIcon: {
    color: rgba(255, 50, 50, 0.12),
    fontSize: 205,
    position: 'absolute',
    right: 50,
    top: -50
  },
  errorStack: {
    '::selection': {
      backgroundColor: rgba(101, 55, 55, 0.26)
    },
    backgroundColor: '#272020',
    border: `solid ${(1).px()} #463131`,
    color: '#BDB3B3',
    cursor: 'text',
    fontFamily: 'Inconsolata',
    fontSize: 16,
    overflowX: 'auto',
    padding: padding(10),
    userSelect: 'text'
  },
  modal: {
    cursor: 'default',
    margin: margin((13).rem(), 'auto'),
    userSelect: 'none'
  }
});
