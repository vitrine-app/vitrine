import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { css, StyleSheet } from 'aphrodite';
import { border, margin, padding, rgba } from 'css-verbose';
import * as moment from 'moment';
import * as React from 'react';
import { FormattedMessage, InjectedIntl, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Grid } from 'semantic-ui-react';

import { PlayableGame } from '@models/PlayableGame';
import { formatTimePlayed, urlify } from '../../helpers';
import { GameInfosBreaker, GameInfosPanel } from '../../ui/atoms/GameInfosPanel';
import { SectionTitle } from '../../ui/atoms/SectionTitle';
import { BlurPicture } from '../../ui/BlurPicture';
import { CirclePercentage } from '../../ui/CirclePercentage';
import { GameInformation } from '../../ui/molecules/GameInformation';
import { GenresList } from '../../ui/molecules/GenresList';
import { SplitBar } from '../../ui/SplitBar';
import { AppState } from '../redux/AppState';
import { VitrineComponent } from '../VitrineComponent';

import { faAlignLeft, faCalendar, faGamepad, faPlay, faStopwatch, faTerminal, faUserTie } from '@fortawesome/fontawesome-free-solid';

interface Props {
  selectedGame: PlayableGame;
  launchGame: (gameUuid: string) => void;
  intl: InjectedIntl;
}

interface State {
  backgroundImage: string;
}

class GameContainer extends VitrineComponent<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = {
      backgroundImage: 'none'
    };
  }

  public static getDerivedStateFromProps(nextProps: Props): Partial<State> {
    if (!nextProps.selectedGame) {
      return { backgroundImage: 'none' };
    }

    let backgroundImage: string;
    if (nextProps.selectedGame && nextProps.selectedGame.details.backgroundScreen) {
      backgroundImage = urlify(nextProps.selectedGame.details.backgroundScreen);
    } else {
      backgroundImage = 'none';
    }
    return { backgroundImage };
  }

  public render(): JSX.Element {
    const gameContainer: JSX.Element = this.props.selectedGame ? (
      <div className={css(styles.gamePanel)}>
        <Grid className={css(styles.gameHeader)}>
          <Grid.Column width={1} />
          <Grid.Column width={9}>
            <h1 className={css(styles.gameTitle)}>{this.props.selectedGame.name}</h1>
            <Button className={css(styles.playButton)} onClick={this.props.launchGame.bind(null, this.props.selectedGame.uuid)}>
              <FontAwesomeIcon className={css(styles.icon)} icon={faPlay} size={'sm'} />
              <FormattedMessage id={'actions.playGame'} />
            </Button>
            <GameInfosPanel isFlex={true}>
              <div style={{ flex: 8 }}>
                <GameInformation
                  icon={faStopwatch}
                  title={this.props.intl.formatMessage({ id: 'game.timePlayed' })}
                  value={formatTimePlayed(this.props.selectedGame.timePlayed, this.props.intl.formatMessage)}
                />
                <GameInformation
                  icon={faTerminal}
                  title={this.props.intl.formatMessage({ id: 'game.developer' })}
                  value={this.props.selectedGame.details.developer}
                />
                <GameInformation
                  icon={faUserTie}
                  title={this.props.intl.formatMessage({ id: 'game.publisher' })}
                  value={this.props.selectedGame.details.publisher}
                />
              </div>
              <div style={{ flex: 2 }}>
                <CirclePercentage percentage={this.props.selectedGame.details.rating} />
              </div>
            </GameInfosPanel>
            <GameInfosBreaker />
            <div className={css(styles.specificInfos)}>
              <div style={{ flex: 2 }}>
                <GameInfosPanel leftSide={true}>
                  <GameInformation
                    icon={faCalendar}
                    isSmall={true}
                    title={this.props.intl.formatMessage({ id: 'game.releaseDate' })}
                    value={
                      this.props.selectedGame.details.releaseDate
                        ? moment(this.props.selectedGame.details.releaseDate).format('DD/MM/YYYY')
                        : this.props.intl.formatMessage({ id: 'game.unknownReleaseDate' })
                    }
                  />
                  {!!this.props.selectedGame.details.genres.length && (
                    <React.Fragment>
                      <FontAwesomeIcon className={css(styles.icon)} icon={faGamepad} size={'lg'} />
                      <SectionTitle>
                        <FormattedMessage id={'game.genres'} />
                      </SectionTitle>
                      <GenresList formatMessage={this.props.intl.formatMessage} genres={this.props.selectedGame.details.genres} />
                    </React.Fragment>
                  )}
                </GameInfosPanel>
              </div>
              <div style={{ flex: 3 }}>
                <GameInfosPanel rightSide={true}>
                  <FontAwesomeIcon className={css(styles.icon)} icon={faAlignLeft} size={'lg'} />
                  <SectionTitle>
                    <FormattedMessage id={'game.summary'} />
                  </SectionTitle>
                  <div className={css(styles.gameDescription)}>
                    {this.props.selectedGame.details.summary
                      .split('\n')
                      .filter((section: string) => section && !/^\s+$/.test(section))
                      .map((section: string, index: number) => (
                        <p className={css(styles.gameDescriptionParagraph)} key={index}>
                          {section}
                        </p>
                      ))}
                  </div>
                </GameInfosPanel>
              </div>
            </div>
          </Grid.Column>
          <Grid.Column width={5} className={css(styles.gameCover)}>
            <BlurPicture
              faIcon={faPlay}
              fontSize={125}
              background={this.props.selectedGame.details.cover}
              clickHandler={this.props.launchGame.bind(null, this.props.selectedGame.uuid)}
            />
          </Grid.Column>
          <Grid.Column width={1} />
        </Grid>
      </div>
    ) : (
      <div className={css(styles.noSelectedGame)}>
        <span className={css(styles.noSelectedGameTitle)}>
          <FormattedMessage id={'welcomeMessage'} />
        </span>
        <SplitBar />
        <p className={css(styles.noSelectedGameText)}>
          <FormattedMessage id={'description'} />
        </p>
      </div>
    );

    return (
      <Grid.Column className={css(styles.gameContainerWrapper)}>
        <div className={css(styles.gameContainer)}>
          {gameContainer}
          <div className={css(styles.gameBackground)} style={{ backgroundImage: this.state.backgroundImage }} />
        </div>
        {this.checkErrors()}
      </Grid.Column>
    );
  }
}

const styles: React.CSSProperties & any = StyleSheet.create({
  gameBackground: {
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${(100).percents()} ${(100).percents()}`,
    filter: `blur(${(4).px()})`,
    height: (101).percents(),
    left: -5,
    opacity: 0.5,
    position: 'absolute',
    top: -5,
    transition: `${150}ms ease`,
    width: (101).percents(),
    zIndex: -1
  },
  gameContainer: {
    background: `radial-gradient(ellipse at center, ${rgba(131, 131, 131, 0.08)} ${0}%, ${rgba(0, 0, 0, 0.76)} ${(120).percents()})`,
    height: `${100}%`,
    overflow: 'hidden'
  },
  gameContainerWrapper: {
    overflow: 'hidden',
    padding: 0,
    width: (84.5).percents()
  },
  gameCover: {
    height: (75).percents()
  },
  gameDescription: {
    borderRadius: 3,
    height: 328,
    margin: margin(20, 0, 10),
    maxHeight: 328,
    minHeight: 160,
    overflowY: 'auto'
  },
  gameDescriptionParagraph: {
    lineHeight: 1.8
  },
  gameHeader: {
    height: (100).percents(),
    marginTop: 40
  },
  gamePanel: {
    height: (100).percents(),
    margin: 0,
    padding: 50
  },
  gameTitle: {
    color: rgba(255, 255, 255, 0.66),
    fontSize: 37,
    fontWeight: 400
  },
  icon: {
    margin: margin(0, 15, 0, 0)
  },
  noSelectedGame: {
    padding: 50
  },
  noSelectedGameHr: {
    border: 'none',
    borderTop: border(1, 'solid', rgba(202, 202, 202, 0.4)),
    margin: margin(30, 0, 20)
  },
  noSelectedGameText: {
    fontSize: 16,
    lineHeight: 1.6
  },
  noSelectedGameTitle: {
    display: 'block',
    fontSize: 30,
    marginTop: 45
  },
  playButton: {
    ':active': {
      backgroundColor: rgba(241, 237, 211, 0.5),
      color: rgba(255, 255, 255, 0.8),
      transform: `scale(${1.04})`
    },
    ':hover': {
      backgroundColor: rgba(241, 237, 211, 0.3),
      color: rgba(255, 255, 255, 0.75)
    },
    backgroundColor: rgba(241, 237, 211, 0.2),
    borderRadius: 2,
    color: rgba(255, 255, 255, 0.6),
    fontSize: 16,
    letterSpacing: 1.3,
    margin: margin(10, 0),
    padding: padding(15, 26),
    textTransform: 'uppercase'
  },
  specificInfos: {
    alignItems: 'flex-start',
    display: 'flex'
  }
});

const mapStateToProps = (state: AppState) => ({
  selectedGame: state.selectedGame
});

const GameContainerContainer = injectIntl(
  connect(
    mapStateToProps,
    null
  )(GameContainer)
);

export { GameContainerContainer as GameContainer };
