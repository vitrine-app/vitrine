import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { css, StyleSheet } from 'aphrodite';
import { rgba } from 'css-verbose';
import * as React from 'react';
import { Header } from 'semantic-ui-react';

import { loaderServerListener } from '../ServerListener';

import { faCog } from '@fortawesome/fontawesome-free-solid';
import * as vitrineIcon from '../../resources/images/vitrine.ico';

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
      updateDownload: false,
      downloadProgress: 0
    };

    this.startUpdateDownload = this.startUpdateDownload.bind(this);
    this.updateProgress = this.updateProgress.bind(this);
    this.launchClient = this.launchClient.bind(this);
  }

  public componentDidMount() {
    loaderServerListener.listen('update-found', this.startUpdateDownload)
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
      updateDownload: true,
      downloadProgress: 0
    });
  }

  private updateProgress(downloadProgress: number) {
    const displayedInfo: string = downloadProgress < 100
      ? `Updating to ${this.lastUpdateVersion}... | ${downloadProgress.percents()}` : 'Installing...';
    this.setState({
      downloadProgress,
      displayedInfo
    });
  }

  private launchClient() {
    this.setState({
      displayedInfo: 'Launching...'
    }, () => {
      loaderServerListener.send('launch-client');
    });
  }

  public render(): JSX.Element {
    return (
      <div className={css(styles.loader)}>
        <Header as={'h1'} className={css(styles.titleSpan)}>Vitrine</Header>
        <div className={css(styles.loaderDiv)}>
          <img
            src={vitrineIcon}
            className={css(styles.loaderIcon)}
          />
        </div>
        <span
          className={css(styles.infosSpan)}
          style={{ display: this.state.displayedInfo ? 'inline' : 'none' }}
        >
          {this.state.displayedInfo} <FontAwesomeIcon icon={faCog} spin={true}/>
        </span>
        <div
          className={`progress ${css(styles.downloadBar)}`}
          style={{ display: this.state.updateDownload ? 'block' : 'none' }}
        >
          <div
            className={`progress-bar active ${css(styles.downloadBarProgress)}`}
            role='progressbar'
            style={{ width: this.state.downloadProgress ? this.state.downloadProgress.percents() : 0..percents() }}
          />
        </div>
      </div>
    );
  }
}

const pulseKeyframes: React.CSSProperties & any = {
  to: {
    boxShadow: `${0} ${0} ${0} ${45..px()} ${rgba(117, 76, 46, 0)}`
  }
};

const styles: React.CSSProperties & any = StyleSheet.create({
  loader: {
    'textAlign': 'center',
    'padding': 7,
    'userSelect': 'none',
    'cursor': 'default',
    '-webkitAppRegion': 'no-drag'
  },
  loaderDiv: {
    margin: 4
  },
  loaderIcon: {
    width: 125,
    margin: 14,
    borderRadius: 100,
    boxShadow: `${0} ${0} ${0} ${0} ${rgba(117, 76, 46, 0.8)}`,
    animationName: [ pulseKeyframes ],
    animationDuration: `${1.5}s`,
    animationIterationCount: 'infinite',
    animationTimingFunction: `cubic-bezier(${0.66}, ${0}, ${0}, ${1})`,
    userSelect: 'none',
    '-webkitUserDrag': 'none'
  },
  titleSpan: {
    marginTop: 15,
    fontSize: 40,
    opacity: 0.4,
    textTransform: 'capitalize',
    fontVariant: 'small-caps'
  },
  infosSpan: {
    opacity: 0.4,
    fontSize: 17
  },
  downloadBar: {
    width: 46..percents(),
    height: 8,
    marginLeft: 27..percents(),
    marginTop: 6,
    borderRadius: 3,
    backgroundColor: '#4A453F'
  },
  downloadBarProgress: {
    backgroundColor: rgba(199, 120, 63, 0.5),
    height: 100..percents(),
    borderRadius: 3,
    transition: `width ${0.2}s ease-out`
  }
});
