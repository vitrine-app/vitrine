import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { css, StyleSheet } from 'aphrodite';
import { border, margin, rgba } from 'css-verbose';
import * as moment from 'moment';
import * as React from 'react';
import { FormattedMessage, InjectedIntl, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Button, Form, Grid, Input, TextArea } from 'semantic-ui-react';

import { PlayableGame } from '@models/PlayableGame';
import { GameSource, PotentialGame } from '@models/PotentialGame';
import { notify, openExecutableDialog, openImageDialog } from '../../helpers';
import { BlurPicture } from '../../ui/BlurPicture';
import { DatePicker } from '../../ui/DatePicker';
import { ImagesCollection } from '../../ui/ImagesCollection';
import { NumberPicker } from '../../ui/NumberPicker';
import { Action } from '../redux/actions/actionsTypes';
import { addPlayableGames, editPlayableGame, selectGame, setGameToEdit, setPotentialGameToAdd } from '../redux/actions/games';
import { closeGameAddModal, closeIgdbResearchModal, closeTimePlayedEditionModal } from '../redux/actions/modals';
import { AppState } from '../redux/AppState';
import { IgdbResearchModal } from '../researchGame/IgdbResearchModal';
import { serverListener } from '../serverListener';
import { VitrineComponent } from '../VitrineComponent';

import { faFolderOpen } from '@fortawesome/fontawesome-free-solid';
import { FadingModal } from '../../ui/FadingModal';

interface Props {
  internetConnection: boolean;
  selectedGame: PlayableGame;
  potentialGameToAdd: PotentialGame;
  gameToEdit: PlayableGame;
  visible: boolean;
  igdbResearchModalVisible: boolean;
  intl: InjectedIntl;
  addPlayableGames: (playableGames: PlayableGame[]) => void;
  editPlayableGame: (playableGame: PlayableGame) => void;
  setPotentialGameToAdd: (potentialGame: PotentialGame) => void;
  setGameToEdit: (playableGame: PlayableGame) => void;
  selectGame: (selectedGame: PlayableGame) => void;
  closeGameAddModal: () => void;
  closeIgdbResearchModal: () => void;
  closeTimePlayedEditionModal: () => void;
}

interface State {
  gameData: Partial<{
    name: string;
    series: string;
    date: string;
    developer: string;
    publisher: string;
    genres: string;
    rating: number;
    summary: string;
    executable: string;
    arguments: string;
    cover: string;
    backgroundScreen: string;
    potentialBackgrounds: string[];
    source: GameSource;
  }>;
  editing: boolean;
  modalVisible: boolean;
  igdbFilled: boolean;
  submitButtonLoading: boolean;
  igdbButtonLoading: boolean;
}

class GameAddModal extends VitrineComponent<Props, State> {
  private readonly emptyState: State;

  public constructor(props: Props) {
    super(props);

    this.emptyState = {
      editing: false,
      gameData: {
        arguments: '',
        backgroundScreen: '',
        cover: '',
        date: '',
        developer: '',
        executable: '',
        genres: '',
        name: '',
        potentialBackgrounds: [],
        publisher: '',
        rating: undefined,
        series: '',
        source: GameSource.LOCAL,
        summary: ''
      },
      igdbButtonLoading: false,
      igdbFilled: false,
      modalVisible: this.props.visible,
      submitButtonLoading: false
    };
    this.state = { ...this.emptyState };

    this.closeModal = this.closeModal.bind(this);
    this.changeBackgroundHandler = this.changeBackgroundHandler.bind(this);
    this.gameCoverClickHandler = this.gameCoverClickHandler.bind(this);
    this.inputChangeHandler = this.inputChangeHandler.bind(this);
    this.dateChangeHandler = this.dateChangeHandler.bind(this);
    this.ratingChangeHandler = this.ratingChangeHandler.bind(this);
    this.executableButton = this.executableButton.bind(this);
    this.searchIgdbButton = this.searchIgdbButton.bind(this);
    this.submitButton = this.submitButton.bind(this);
  }

  private fillIgdbGame(gameInfos: any) {
    this.setState({
      gameData: {
        ...this.state.gameData,
        backgroundScreen: gameInfos.screenshots.length ? gameInfos.screenshots[0] : '',
        cover: gameInfos.cover,
        date: gameInfos.releaseDate ? moment(gameInfos.releaseDate).format('DD/MM/YYYY') : '',
        developer: gameInfos.developer || '',
        genres: gameInfos.genres.length ? gameInfos.genres.join(', ') : '',
        name: gameInfos.name,
        potentialBackgrounds: gameInfos.screenshots || [],
        publisher: gameInfos.publisher || '',
        rating: gameInfos.rating || '',
        series: gameInfos.series || '',
        summary: gameInfos.summary || ''
      },
      igdbButtonLoading: false,
      igdbFilled: true
    });
    this.props.closeIgdbResearchModal();
  }

  private addPlayableGame(game: PlayableGame) {
    this.props.addPlayableGames([game]);
    this.closeModal();
    notify(this.props.intl.formatMessage({ id: 'toasts.addingGame' }, { name: game.name }), true);
    this.setState({
      submitButtonLoading: false
    });
  }

  private editPlayableGame(game: PlayableGame) {
    this.props.editPlayableGame(game);
    if (game.uuid === this.props.selectedGame.uuid) {
      this.props.selectGame(game);
    }
    if (this.props.igdbResearchModalVisible) {
      this.props.closeTimePlayedEditionModal();
    }
    if (this.props.visible) {
      this.closeModal();
    }
    notify(this.props.intl.formatMessage({ id: 'toasts.editingGame' }, { name: game.name }), true);
    this.setState({
      submitButtonLoading: false
    });
  }

  private closeModal() {
    this.props.closeGameAddModal();
    setTimeout(() => {
      this.props.setPotentialGameToAdd(null);
      this.props.setGameToEdit(null);
      this.setState({ ...this.emptyState });
    }, this.modalsTransitionDuration);
  }

  private gameCoverClickHandler() {
    const cover: string = openImageDialog(this.props.intl.formatMessage);
    if (cover) {
      this.setState({
        gameData: {
          ...this.state.gameData,
          cover
        }
      });
    }
  }

  private inputChangeHandler(event: any) {
    const name: string | any = event.target.name;
    const value: string = event.target.value;

    this.setState({
      gameData: {
        ...this.state.gameData,
        [name]: value
      }
    });
  }

  private dateChangeHandler(date: moment.Moment | string) {
    this.setState({
      gameData: {
        ...this.state.gameData,
        date: typeof date === 'string' ? date : date.format('DD/MM/YYYY')
      }
    });
  }

  private ratingChangeHandler(rating: number | any) {
    this.setState({
      gameData: {
        ...this.state.gameData,
        rating
      }
    });
  }

  private executableButton() {
    const executable: string = openExecutableDialog(this.props.intl.formatMessage);
    if (!executable) {
      return;
    }
    this.setState({
      gameData: {
        ...this.state.gameData,
        executable
      }
    });
  }

  private changeBackgroundHandler(backgroundScreen: string) {
    this.setState({
      gameData: {
        ...this.state.gameData,
        backgroundScreen
      }
    });
  }

  private searchIgdbButton() {
    this.setState({
      igdbButtonLoading: true
    });
    serverListener.send('search-igdb-games', this.state.gameData.name);
  }

  private submitButton() {
    const gameInfos: any = { ...this.state.gameData };
    delete gameInfos.potentialBackgrounds;
    if (gameInfos.cover && !gameInfos.cover.startsWith('http') && !gameInfos.cover.startsWith('file://')) {
      gameInfos.cover = `file://${gameInfos.cover}`;
    }
    if (gameInfos.backgroundScreen && !gameInfos.backgroundScreen.startsWith('http') && !gameInfos.backgroundScreen.startsWith('file://')) {
      gameInfos.backgroundScreen = `file://${gameInfos.backgroundScreen}`;
    }

    this.setState({
      submitButtonLoading: true
    });
    if (this.state.editing) {
      serverListener.send('edit-game', this.props.gameToEdit.uuid, gameInfos);
    } else {
      serverListener.send('add-game', gameInfos);
    }
  }

  public componentDidMount() {
    serverListener
      .listen('send-igdb-game', this.fillIgdbGame.bind(this))
      .listen('add-playable-game', this.addPlayableGame.bind(this))
      .listen('edit-playable-game', this.editPlayableGame.bind(this));
  }

  public static getDerivedStateFromProps(nextProps: Props, prevState: State): Partial<State> {
    let gameToHandle: PotentialGame;
    let editing: boolean;

    if (nextProps.gameToEdit) {
      gameToHandle = nextProps.gameToEdit;
      editing = true;
    } else if (nextProps.potentialGameToAdd) {
      gameToHandle = nextProps.potentialGameToAdd;
      editing = false;
    } else {
      return null;
    }

    const [executable, args]: string[] = gameToHandle.commandLine.length > 1 ? gameToHandle.commandLine : [gameToHandle.commandLine[0], ''];
    return !prevState.igdbFilled
      ? {
          editing,
          gameData: {
            arguments: args,
            backgroundScreen: gameToHandle.details.backgroundScreen || '',
            cover: gameToHandle.details.cover,
            date: gameToHandle.details.releaseDate ? moment(gameToHandle.details.releaseDate).format('DD/MM/YYYY') : '',
            developer: gameToHandle.details.developer || '',
            executable,
            genres: gameToHandle.details.genres ? gameToHandle.details.genres.join(', ') : '',
            name: gameToHandle.name,
            potentialBackgrounds: gameToHandle.details.backgroundScreen ? [gameToHandle.details.backgroundScreen] : [],
            publisher: gameToHandle.details.publisher || '',
            rating: gameToHandle.details.rating || '',
            series: gameToHandle.details.series || '',
            source: gameToHandle.source,
            summary: gameToHandle.details.summary || ''
          }
        }
      : {
          igdbFilled: false
        };
  }

  public render(): JSX.Element {
    return (
      <FadingModal
        actions={
          <React.Fragment>
            <Button
              secondary={true}
              disabled={!this.state.gameData.name || !this.props.internetConnection}
              loading={this.state.igdbButtonLoading}
              onClick={this.searchIgdbButton}
            >
              <FormattedMessage id={'actions.fillWithIgdb'} />
            </Button>
            <Button
              primary={true}
              disabled={!this.state.gameData.name || !this.state.gameData.executable}
              loading={this.state.submitButtonLoading}
              onClick={this.submitButton}
            >
              <FormattedMessage id={this.state.editing ? 'actions.editGame' : 'actions.submitNewGame'} />
            </Button>
          </React.Fragment>
        }
        onClose={this.closeModal}
        size={'large'}
        title={this.props.intl.formatMessage({ id: this.state.editing ? 'actions.editGameTitle' : 'actions.addGame' })}
        visible={this.props.visible}
      >
        <Grid>
          <Grid.Column width={3}>
            <label className={css(styles.formLabel)}>
              <FormattedMessage id={'game.cover'} />
            </label>
            <div className={css(styles.coverWrapper)}>
              <BlurPicture faIcon={faFolderOpen} fontSize={55} background={this.state.gameData.cover} clickHandler={this.gameCoverClickHandler} />
            </div>
          </Grid.Column>
          <Grid.Column width={1} />
          <Grid.Column width={12}>
            <Form>
              <Form.Field>
                <label className={css(styles.formLabel)}>
                  <FormattedMessage id={'game.name'} />
                </label>
                <Input
                  name={'name'}
                  size={'large'}
                  placeholder={this.props.intl.formatMessage({ id: 'game.name' })}
                  value={this.state.gameData.name}
                  onChange={this.inputChangeHandler}
                />
              </Form.Field>
              <Grid>
                <Grid.Column width={11}>
                  <Form.Field>
                    <label className={css(styles.formLabel)}>
                      <FormattedMessage id={'game.name'} />
                    </label>
                    <Input
                      name={'series'}
                      size={'large'}
                      placeholder={this.props.intl.formatMessage({ id: 'game.name' })}
                      value={this.state.gameData.series}
                      onChange={this.inputChangeHandler}
                    />
                  </Form.Field>
                </Grid.Column>
                <Grid.Column width={5}>
                  <Form.Field>
                    <label className={css(styles.formLabel)}>
                      <FormattedMessage id={'game.releaseDate'} />
                    </label>
                    <DatePicker
                      value={this.state.gameData.date}
                      dateFormat={'DD/MM/YYYY'}
                      onChange={this.dateChangeHandler}
                      inputProps={{
                        placeholder: this.props.intl.formatMessage({ id: 'game.releaseDate' }),
                        readOnly: true,
                        size: 'large'
                      }}
                    />
                  </Form.Field>
                </Grid.Column>
              </Grid>
              <Grid>
                <Grid.Column width={8}>
                  <Form.Field>
                    <label className={css(styles.formLabel)}>
                      <FormattedMessage id={'game.developer'} />
                    </label>
                    <Input
                      name={'developer'}
                      size={'large'}
                      placeholder={this.props.intl.formatMessage({ id: 'game.developer' })}
                      value={this.state.gameData.developer}
                      onChange={this.inputChangeHandler}
                    />
                  </Form.Field>
                </Grid.Column>
                <Grid.Column width={8}>
                  <Form.Field>
                    <label className={css(styles.formLabel)}>
                      <FormattedMessage id={'game.publisher'} />
                    </label>
                    <Input
                      name={'publisher'}
                      size={'large'}
                      placeholder={this.props.intl.formatMessage({ id: 'game.publisher' })}
                      value={this.state.gameData.publisher}
                      onChange={this.inputChangeHandler}
                    />
                  </Form.Field>
                </Grid.Column>
              </Grid>
              <Grid>
                <Grid.Column style={{ width: (84.5).percents() }}>
                  <Form.Field>
                    <label className={css(styles.formLabel)}>
                      <FormattedMessage id={'game.genres'} />
                    </label>
                    <Input
                      name={'genres'}
                      size={'large'}
                      placeholder={this.props.intl.formatMessage({ id: 'game.genres' })}
                      value={this.state.gameData.genres}
                      onChange={this.inputChangeHandler}
                    />
                  </Form.Field>
                </Grid.Column>
                <Grid.Column width={2}>
                  <Form.Field>
                    <label className={css(styles.formLabel)}>
                      <FormattedMessage id={'game.rating'} />
                    </label>
                    <NumberPicker
                      min={1}
                      max={100}
                      name={'rating'}
                      placeholder={this.props.intl.formatMessage({ id: 'game.rating' })}
                      value={this.state.gameData.rating}
                      onChange={this.ratingChangeHandler}
                    />
                  </Form.Field>
                </Grid.Column>
              </Grid>
              <Grid>
                <Grid.Column width={16}>
                  <Form.Field>
                    <label className={css(styles.formLabel)}>
                      <FormattedMessage id={'game.summary'} />
                    </label>
                    <TextArea
                      name={'summary'}
                      className={css(styles.formTextArea)}
                      placeholder={this.props.intl.formatMessage({ id: 'game.summary' })}
                      value={this.state.gameData.summary}
                      onChange={this.inputChangeHandler}
                    />
                  </Form.Field>
                </Grid.Column>
              </Grid>
              <hr className={css(styles.formHr)} />
              <Grid>
                <Grid.Column width={16}>
                  <Form.Field>
                    <label className={css(styles.formLabel)}>
                      <FormattedMessage id={'game.executable'} />
                    </label>
                    <Input
                      label={
                        <Button secondary={true} onClick={this.executableButton.bind(this)}>
                          <FontAwesomeIcon icon={faFolderOpen} />
                        </Button>
                      }
                      labelPosition={'right'}
                      name={'executable'}
                      size={'large'}
                      placeholder={this.props.intl.formatMessage({ id: 'game.executable' })}
                      value={this.state.gameData.executable}
                      onClick={this.executableButton}
                      readOnly={true}
                    />
                  </Form.Field>
                </Grid.Column>
              </Grid>
              <Grid>
                <Grid.Column width={16}>
                  <Form.Field>
                    <label className={css(styles.formLabel)}>
                      <FormattedMessage id={'game.lineArguments'} />
                    </label>
                    <div className={'ui large input'}>
                      <input
                        name={'arguments'}
                        className={css(styles.lineArgumentsInput)}
                        placeholder={this.props.intl.formatMessage({ id: 'game.lineArguments' })}
                        value={this.state.gameData.arguments}
                        onChange={this.inputChangeHandler}
                      />
                    </div>
                  </Form.Field>
                </Grid.Column>
              </Grid>
              <hr className={css(styles.formHr)} />
              <Grid>
                <Grid.Column width={16}>
                  <Form.Field>
                    <label className={css(styles.formLabel)}>
                      <FormattedMessage id={'game.backgroundImage'} />
                    </label>
                    <ImagesCollection images={this.state.gameData.potentialBackgrounds} onChange={this.changeBackgroundHandler} />
                  </Form.Field>
                </Grid.Column>
              </Grid>
              <input name={'cover'} value={this.state.gameData.cover} onChange={this.inputChangeHandler} hidden={true} />
              <input name={'background'} value={this.state.gameData.backgroundScreen} onChange={this.inputChangeHandler} hidden={true} />
              <input name={'source'} value={this.state.gameData.source} onChange={this.inputChangeHandler} hidden={true} />
            </Form>
          </Grid.Column>
        </Grid>
        <IgdbResearchModal />
        {this.checkErrors()}
      </FadingModal>
    );
  }
}

const styles: React.CSSProperties & any = StyleSheet.create({
  coverWrapper: {
    height: 270,
    paddingTop: 3
  },
  formHr: {
    border: 'none',
    borderTop: border(1, 'solid', rgba(238, 238, 238, 0.15)),
    margin: margin(30, 0, 16)
  },
  formLabel: {
    fontSize: (1).em(),
    fontWeight: 'normal'
  },
  formTextArea: {
    fontSize: (1.14285714).em(),
    height: (7).em(),
    lineHeight: 1.4,
    resize: 'none'
  },
  lineArgumentsInput: {
    fontFamily: 'Inconsolata'
  },
  modal: {
    cursor: 'default',
    margin: margin((1).rem(), 'auto'),
    userSelect: 'none'
  },
  modalBody: {
    maxHeight: (82).vh(),
    overflowY: 'auto'
  }
});

const mapStateToProps = (state: AppState) => ({
  gameToEdit: state.gameToEdit,
  igdbResearchModalVisible: state.igdbResearchModalVisible,
  internetConnection: state.internetConnection,
  potentialGameToAdd: state.potentialGameToAdd,
  selectedGame: state.selectedGame,
  visible: state.gameAddModalVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  addPlayableGames(playableGames: PlayableGame[]) {
    dispatch(addPlayableGames(playableGames));
  },
  editPlayableGame(playableGame: PlayableGame) {
    dispatch(editPlayableGame(playableGame));
  },
  setPotentialGameToAdd(potentialGame: PotentialGame) {
    dispatch(setPotentialGameToAdd(potentialGame));
  },
  setGameToEdit(playableGame: PlayableGame) {
    dispatch(setGameToEdit(playableGame));
  },
  selectGame(selectedGame: PlayableGame) {
    dispatch(selectGame(selectedGame));
  },
  closeGameAddModal() {
    dispatch(closeGameAddModal());
  },
  closeIgdbResearchModal() {
    dispatch(closeIgdbResearchModal());
  },
  closeTimePlayedEditionModal() {
    dispatch(closeTimePlayedEditionModal());
  }
});

const GameAddModalContainer = injectIntl(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(GameAddModal)
);

export { GameAddModalContainer as GameAddModal };