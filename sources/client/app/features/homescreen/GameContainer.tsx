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
import { BlurPicture } from '../../ui/BlurPicture';
import { CirclePercentage } from '../../ui/CirclePercentage';
import { AppState } from '../redux/AppState';
import { VitrineComponent } from '../VitrineComponent';

import { faPlay } from '@fortawesome/fontawesome-free-solid';
import * as lessVars from 'less-vars-loader?camelCase&resolveVariables!../../../resources/less/theme/globals/site.variables';

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
    if (!nextProps.selectedGame)
      return { backgroundImage: 'none' };

    let backgroundImage: string;
    if (nextProps.selectedGame && nextProps.selectedGame.details.backgroundScreen)
      backgroundImage = urlify(nextProps.selectedGame.details.backgroundScreen);
    else
      backgroundImage = 'none';
    return { backgroundImage };
  }

  public render(): JSX.Element {
    let gameContainer: JSX.Element;

    if (this.props.selectedGame)
      gameContainer = (
        <Grid className={css(styles.gameCore)}>
          <Grid.Column width={11}>
            <h1 className={css(styles.gameCoreTitle)}>{this.props.selectedGame.name}</h1>
            <div className={css(styles.gameInfosRegion)}>
              <Button
                onClick={this.props.launchGame.bind(null, this.props.selectedGame.uuid)}
                primary={true}
              >
                <FontAwesomeIcon icon={faPlay} size={'sm'}/> <FormattedMessage id={'actions.playGame'}/>
              </Button>
              <span className={css(styles.gameTimePlayed)}>
                {this.props.selectedGame.timePlayed ? formatTimePlayed(this.props.selectedGame.timePlayed, this.props.intl.formatMessage) : ''}
              </span>
            </div>
            <div className={css(styles.gameInfosRegion)}>
              <Grid>
                <Grid.Column width={11}>
                  <Grid>
                    <Grid.Column width={5} className={css(styles.developerGridColumn)}>
                      <strong><FormattedMessage id={'game.developer'}/></strong>
                    </Grid.Column>
                    <Grid.Column width={11} className={css(styles.developerGridColumn)}>
                      {this.props.selectedGame.details.developer}
                    </Grid.Column>
                  </Grid>
                  <Grid>
                    <Grid.Column width={5} className={css(styles.publisherGridColumn)}>
                      <strong><FormattedMessage id={'game.publisher'}/></strong>
                    </Grid.Column>
                    <Grid.Column width={11} className={css(styles.publisherGridColumn)}>
                      {this.props.selectedGame.details.publisher}
                    </Grid.Column>
                  </Grid>
                  <Grid>
                    <Grid.Column width={5} className={css(styles.developerGridColumn)}>
                      <strong><FormattedMessage id={'game.releaseDate'}/></strong>
                    </Grid.Column>
                    <Grid.Column width={11} className={css(styles.developerGridColumn)}>
                      {moment(this.props.selectedGame.details.releaseDate).format('DD/MM/YYYY')}
                    </Grid.Column>
                  </Grid>
                  <Grid>
                    <Grid.Column width={5} className={css(styles.publisherGridColumn)}>
                      <strong><FormattedMessage id={'game.genres'}/></strong>
                    </Grid.Column>
                    <Grid.Column width={11} className={css(styles.publisherGridColumn)}>
                      {this.props.selectedGame.details.genres.map((genre: string) =>
                        this.props.intl.formatMessage({ id: `genresNames.${genre}`} )
                      ).join(', ')}
                    </Grid.Column>
                  </Grid>
                </Grid.Column>
                <Grid.Column width={5}>
                  <CirclePercentage
                    percentage={this.props.selectedGame.details.rating}
                    color={lessVars.primaryColor}
                  />
                </Grid.Column>
              </Grid>
              <hr className={css(styles.gameCoreHr)}/>
              <p className={css(styles.gameDesc)}>
                {this.props.selectedGame.details.summary.split('\n').map((section: string, index: number) =>
                  <span key={index}>
                    {section}
                    <br/>
                  </span>
                )}
              </p>
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
        </Grid>
      );
    else
      gameContainer = (
        <div className={css(styles.noSelectedGame)}>
          <span className={css(styles.noSelectedGameTitle)}>
            <FormattedMessage id={'welcomeMessage'}/>
          </span>
          <hr className={css(styles.noSelectedGameHr)}/>
          <p
            className={css(styles.noSelectedGameText)}
          >
            <FormattedMessage id={'description'}/>
          </p>
        </div>
      );

    return (
      <Grid.Column className={css(styles.gameContainerWrapper)}>
        <div className={css(styles.gameContainer)}>
          {gameContainer}
          <div
            className={css(styles.gameBackground)}
            style={{ backgroundImage: this.state.backgroundImage }}
          />
        </div>
        {this.checkErrors()}
      </Grid.Column>
    );
  }
}

const styles: React.CSSProperties & any = StyleSheet.create({
  gameContainerWrapper: {
    width: 84.5.percents(),
    padding: 0,
    overflow: 'hidden'
  },
  gameContainer: {
    height: `${100}%`,
    background: `radial-gradient(ellipse at center, ${rgba(131, 131, 131, 0.08)} ${0}%, ${rgba(0, 0, 0, 0.76)} ${120..percents()})`,
    overflow: 'hidden'
  },
  gameBackground: {
    position: 'absolute',
    zIndex: -1,
    width: 101..percents(),
    height: 101..percents(),
    top: -5,
    left: -5,
    opacity: 0.5,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${100..percents()} ${100..percents()}`,
    filter: `blur(${4..px()})`,
    transition: `${150}ms ease`
  },
  gameCore: {
    padding: padding(50, 25, 50),
    margin: 0,
    height: 100..percents()
  },
  gameCoreTitle: {
    fontWeight: 400,
    fontSize: 33,
    marginBottom: 40,
    color: rgba(255, 255, 255, 0.66)
  },
  gameCoreHr: {
    border: 'none',
    borderTop: `solid ${1..px()} ${rgba(210, 210, 210, 0.15)}`,
    margin: margin(30, 0),
    width: 97..percents()
  },
  gameInfosRegion: {
    backgroundColor: rgba(0, 0, 0, 0.49),
    padding: padding(13, 24),
    color: '#E4E4E4',
    fontSize: 1.2.em(),
    borderRadius: 3,
    margin: margin(10, 0)
  },
  developerGridColumn: {
    paddingBottom: 5
  },
  publisherGridColumn: {
    paddingTop: 5
  },
  gameTimePlayed: {
    marginLeft: 15
  },
  gameDesc: {
    padding: 20,
    maxHeight: 210,
    minHeight: 160,
    lineHeight: 1.5,
    overflowY: 'auto',
    backgroundColor: rgba(0, 0, 0, 0.2),
    borderRadius: 3
  },
  gameCover: {
    height: 75..percents()
  },
  noSelectedGame: {
    padding: 50
  },
  noSelectedGameTitle: {
    fontSize: 30,
    marginTop: 45,
    display: 'block'
  },
  noSelectedGameHr: {
    border: 'none',
    borderTop: border(1, 'solid', rgba(202, 202, 202, 0.4)),
    margin: margin(30, 0, 20)
  },
  noSelectedGameText: {
    fontSize: 16,
    lineHeight: 1.6
  }
});

const mapStateToProps = (state: AppState) => ({
  selectedGame: state.selectedGame
});

const mapDispatchToProps = () => ({});

const GameContainerContainer = injectIntl(connect(mapStateToProps, mapDispatchToProps)(GameContainer));

export { GameContainerContainer as GameContainer };
