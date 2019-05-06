import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { css, StyleSheet } from 'aphrodite';
import { padding, rgba } from 'css-verbose';
import * as React from 'react';
import { FormattedMessage, InjectedIntl, injectIntl } from 'react-intl';
import { Button } from 'semantic-ui-react';

import { FadingModal } from '../../ui/FadingModal';
import { serverListener } from '../serverListener';

import { faChevronDown, faChevronUp } from '@fortawesome/fontawesome-free-solid';

interface Props {
  intl: InjectedIntl;
}

interface State {
  detailsDisplayed: boolean;
  visible: boolean;
  error?: Error;
}

export const ErrorsWrapper = injectIntl(
  class ErrorsWrapper extends React.Component<Props, State> {
    constructor(props: any) {
      super(props);

      this.state = {
        detailsDisplayed: false,
        visible: false
      };
    }

    public componentDidCatch(error: Error) {
      this.setState({
        error,
        visible: true
      });
    }

    private static quitApplication() {
      serverListener.send('quit-application', false);
    }

    private static relaunchApplication() {
      serverListener.send('quit-application', true);
    }

    private toggleDetailsDisplay = () => {
      this.setState(({ detailsDisplayed }: State) => ({
        detailsDisplayed: !detailsDisplayed
      }));
    };

    public render(): JSX.Element {
      const {
        children,
        intl: { formatMessage }
      } = this.props;
      const { detailsDisplayed, error, visible } = this.state;
      if (error) {
        return (
          <FadingModal
            actions={
              <React.Fragment>
                <Button secondary={true} onClick={ErrorsWrapper.quitApplication}>
                  <FormattedMessage id={'actions.quit'} />
                </Button>
                <Button secondary={true} onClick={ErrorsWrapper.relaunchApplication}>
                  <FormattedMessage id={'actions.relaunch'} />
                </Button>
              </React.Fragment>
            }
            onClose={null}
            title={formatMessage({ id: 'crash.title' })}
            visible={visible}
          >
            <span>
              <FormattedMessage id={'crash.text'} />
            </span>
            <div className={css(styles.dropdown)} onClick={this.toggleDetailsDisplay}>
              <FormattedMessage id={'crash.details'} />
              <FontAwesomeIcon className={css(styles.dropdownIcon)} icon={detailsDisplayed ? faChevronUp : faChevronDown} />
            </div>
            {detailsDisplayed && <pre className={css(styles.errorStack)}>{error.stack}</pre>}
          </FadingModal>
        );
      } else {
        return children as JSX.Element;
      }
    }
  }
);

const styles: React.CSSProperties & any = StyleSheet.create({
  dropdown: {
    ':hover': {
      backgroundColor: rgba(255, 255, 255, 0.15)
    },
    alignItems: 'center',
    backgroundColor: rgba(255, 255, 255, 0.1),
    borderRadius: 3,
    cursor: 'pointer',
    display: 'flex',
    fontWeight: 600,
    marginTop: 20,
    padding: padding(14, 20),
    transition: `background-color ${70}ms ease`
  },
  dropdownIcon: {
    marginLeft: 'auto'
  },
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
    borderTop: 'none',
    color: '#BDB3B3',
    cursor: 'text',
    fontFamily: 'Inconsolata',
    fontSize: 16,
    marginTop: 0,
    overflowX: 'auto',
    padding: padding(10),
    userSelect: 'text'
  }
});
