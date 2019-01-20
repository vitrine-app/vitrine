import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { css, StyleSheet } from 'aphrodite';
import { rgba } from 'css-verbose';
import * as React from 'react';
import { Header } from 'semantic-ui-react';

import { loaderServerListener } from '../serverListener';

import { faCog } from '@fortawesome/fontawesome-free-solid';
import * as vitrineIcon from '../../../resources/images/vitrine.ico';

interface State {
  displayedInfo: string;
  updateDownload: boolean;
  downloadProgress: number;
}

export class VitrineLoader extends React.Component<{}, State> {
  private lastUpdateVersion: string;

  public constructor() {
    super(undefined);

    this.state = {
      displayedInfo: 'Loading...',
      downloadProgress: 0,
      updateDownload: false
    };

    this.startUpdateDownload = this.startUpdateDownload.bind(this);
    this.updateProgress = this.updateProgress.bind(this);
    this.launchClient = this.launchClient.bind(this);
  }

  public componentDidMount() {
    loaderServerListener
      .listen('update-found', this.startUpdateDownload)
      .listen('update-progress', this.updateProgress)
      .listen('no-update-found', this.launchClient);

    loaderServerListener.send('ready');
    this.setState({
      displayedInfo: 'Searching for updates...'
    });
  }

  private startUpdateDownload(lastUpdateVersion: string) {
    this.lastUpdateVersion = lastUpdateVersion;
    this.setState({
      displayedInfo: `Updating to ${this.lastUpdateVersion}...`,
      downloadProgress: 0,
      updateDownload: true
    });
  }

  private updateProgress(downloadProgress: number) {
    const displayedInfo: string =
      downloadProgress < 100 ? `Updating to ${this.lastUpdateVersion}... | ${downloadProgress.percents()}` : 'Installing...';
    this.setState({
      displayedInfo,
      downloadProgress
    });
  }

  private launchClient() {
    this.setState(
      {
        displayedInfo: 'Launching...'
      },
      () => {
        loaderServerListener.send('launch-client');
      }
    );
  }

  public render(): JSX.Element {
    return (
      <div className={css(styles.loader)}>
        <Header as={'h1'} className={css(styles.titleSpan)}>
          Vitrine
        </Header>
        <div className={css(styles.loaderDiv)}>
          <img src={vitrineIcon} className={css(styles.loaderIcon)} />
        </div>
        <span className={css(styles.infosSpan)} style={{ display: this.state.displayedInfo ? 'inline' : 'none' }}>
          {this.state.displayedInfo} <FontAwesomeIcon icon={faCog} spin={true} />
        </span>
        <div className={`progress ${css(styles.downloadBar)}`} style={{ display: this.state.updateDownload ? 'block' : 'none' }}>
          <div
            className={`progress-bar active ${css(styles.downloadBarProgress)}`}
            role="progressbar"
            style={{
              width: this.state.downloadProgress ? this.state.downloadProgress.percents() : (0).percents()
            }}
          />
        </div>
      </div>
    );
  }
}

const pulseKeyframes: React.CSSProperties & any = {
  to: {
    boxShadow: `${0} ${0} ${0} ${(45).px()} ${rgba(117, 76, 46, 0)}`
  }
};

const styles: React.CSSProperties & any = StyleSheet.create({
  downloadBar: {
    backgroundColor: '#4A453F',
    borderRadius: 3,
    height: 8,
    marginLeft: (27).percents(),
    marginTop: 6,
    width: (46).percents()
  },
  downloadBarProgress: {
    backgroundColor: rgba(199, 120, 63, 0.5),
    borderRadius: 3,
    height: (100).percents(),
    transition: `width ${0.2}s ease-out`
  },
  infosSpan: {
    fontSize: 17,
    opacity: 0.4
  },
  loader: {
    '-webkitAppRegion': 'no-drag',
    cursor: 'default',
    padding: 7,
    textAlign: 'center',
    userSelect: 'none'
  },
  loaderDiv: {
    margin: 4
  },
  loaderIcon: {
    '-webkitUserDrag': 'none',
    animationDuration: `${1.5}s`,
    animationIterationCount: 'infinite',
    animationName: [pulseKeyframes],
    animationTimingFunction: `cubic-bezier(${0.66}, ${0}, ${0}, ${1})`,
    borderRadius: 100,
    boxShadow: `${0} ${0} ${0} ${0} ${rgba(117, 76, 46, 0.8)}`,
    margin: 14,
    userSelect: 'none',
    width: 125
  },
  titleSpan: {
    fontSize: 40,
    fontVariant: 'small-caps',
    marginTop: 15,
    opacity: 0.4,
    textTransform: 'capitalize'
  }
});
