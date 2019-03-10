import { css, StyleSheet } from 'aphrodite';
import * as chunk from 'chunk';
import { margin, padding } from 'css-verbose';
import * as React from 'react';
import { FormattedMessage, InjectedIntl, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Grid, Progress } from 'semantic-ui-react';

import { GamesCollection } from '@models/GamesCollection';
import { PlayableGame } from '@models/PlayableGame';
import { PotentialGame } from '@models/PotentialGame';
import { FadingModal } from '../../ui/FadingModal';
import { BlurPicture } from '../../ui/molecules';
import { Action } from '../redux/actions/actionsTypes';
import { selectGame, setPlayableGames, setPotentialGames, setPotentialGameToAdd } from '../redux/actions/games';
import { closePotentialGamesAddModal, openGameAddModal } from '../redux/actions/modals';
import { AppState } from '../redux/AppState';
import { serverListener } from '../serverListener';
import { VitrineComponent } from '../VitrineComponent';

import { faPlusCircle } from '@fortawesome/fontawesome-free-solid';
import * as lessVars from 'less-vars-loader?camelCase&resolveVariables!../../../resources/less/theme/globals/site.variables';

interface Props {
  closePotentialGamesAddModal: () => void;
  intl: InjectedIntl;
  openGameAddModal: () => void;
  potentialGames: GamesCollection<PotentialGame>;
  playableGames: GamesCollection<PlayableGame>;
  setPotentialGames: (potentialGames: PotentialGame[]) => void;
  setPlayableGames: (playableGames: PlayableGame[]) => void;
  selectGame: (playableGame: PlayableGame) => void;
  setPotentialGameToAdd: (potentialGame: PotentialGame) => void;
  visible: boolean;
}

interface State {
  transitionVisible: boolean;
  addAllGames: boolean;
  potentialGamesNb?: number;
  addedGamesNb?: number;
}

class PotentialGamesAddModal extends VitrineComponent<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = {
      addAllGames: false,
      transitionVisible: true
    };

    this.gameCoverClick = this.gameCoverClick.bind(this);
    this.animateModal = this.animateModal.bind(this);
    this.addAllGamesClick = this.addAllGamesClick.bind(this);
    this.updateAddAllGamesStatus = this.updateAddAllGamesStatus.bind(this);
  }

  public componentDidMount() {
    serverListener.listen('update-add-all-games-status', this.updateAddAllGamesStatus);
  }

  public updateAddAllGamesStatus(playableGames: PlayableGame[], potentialGames: PotentialGame[]) {
    this.props.setPotentialGames(potentialGames);
    this.props.setPlayableGames(playableGames);
    if (this.state.addedGamesNb + 1 === this.state.potentialGamesNb) {
      this.setState({ addAllGames: false }, () => {
        this.props.closePotentialGamesAddModal();
        this.props.selectGame(this.props.playableGames.getGame(0));
      });
    } else {
      this.setState((prevState: State) => ({
        addedGamesNb: prevState.addedGamesNb + 1
      }));
    }
  }

  private gameCoverClick(potentialGame: PotentialGame) {
    this.props.setPotentialGameToAdd(potentialGame);
    this.props.closePotentialGamesAddModal();
    this.props.openGameAddModal();
  }

  private animateModal(startingAnimation: boolean) {
    if (startingAnimation === this.props.visible) {
      this.setState({
        transitionVisible: this.props.visible
      });
    }
  }

  private addAllGamesClick() {
    this.setState({
      addAllGames: true,
      addedGamesNb: 0,
      potentialGamesNb: this.props.potentialGames.size()
    });
    serverListener.send('add-all-games');
  }

  public render(): JSX.Element {
    const potentialGamesRows: PotentialGame[][] = chunk(this.props.potentialGames.getGames(), 6);
    const potentialGamesGrid: JSX.Element = (
      <Grid columns={6}>
        {potentialGamesRows.map((potentialGamesRow: PotentialGame[], index: number) => (
          <Grid.Row className={css(styles.gamesRow)} key={index}>
            {potentialGamesRow.map((potentialGame: PotentialGame, index: number) => (
              <Grid.Column key={index}>
                <div className={css(styles.coverWrapper)}>
                  <BlurPicture
                    background={potentialGame.details.cover}
                    onClick={this.gameCoverClick.bind(null, potentialGame)}
                    faIcon={faPlusCircle}
                    fontSize={55}
                  />
                </div>
                <p className={css(styles.potentialGameName)}>{potentialGame.name}</p>
              </Grid.Column>
            ))}
          </Grid.Row>
        ))}
      </Grid>
    );
    const firstGameName: string = this.props.potentialGames.size() ? this.props.potentialGames.getGame(0).name : '';
    const allGamesProgressBar = (
      <React.Fragment>
        <p>
          <FormattedMessage id={'allGamesDisclaimer'} />
        </p>
        <Progress active={true} color={'orange'} size={'small'} total={this.state.potentialGamesNb} value={this.state.addedGamesNb}>
          <FormattedMessage id={'actions.gameBeingAdded'} values={{ name: firstGameName }} />
        </Progress>
      </React.Fragment>
    );
    // TODO: re-implement feature to add every game at once
    return (
      <FadingModal
        onClose={this.props.closePotentialGamesAddModal}
        size={this.state.addAllGames ? 'mini' : 'large'}
        style={{ margin: margin((1).rem(), 'auto') }}
        title={
          this.state.addAllGames
            ? this.props.intl.formatMessage({ id: 'actions.addAllPotentialGames' })
            : this.props.intl.formatMessage({ id: 'actions.addGames' })
        }
        visible={this.props.visible}
      >
        {this.state.addAllGames ? allGamesProgressBar : potentialGamesGrid}
      </FadingModal>
    );
  }
}

const styles: React.CSSProperties & any = StyleSheet.create({
  addAllGamesButton: {
    float: 'right'
  },
  coverWrapper: {
    height: 200,
    padding: padding(0, 10)
  },
  gamesRow: {
    paddingBottom: 20,
    paddingTop: 20,
    textAlign: 'center'
  },
  modal: {
    cursor: 'default',
    margin: margin((3).rem(), 'auto'),
    userSelect: 'none'
  },
  potentialGameName: {
    fontSize: 17,
    marginTop: 6
  },
  progressBar: {
    backgroundColor: lessVars.primaryColor
  }
});

const mapStateToProps = (state: AppState) => ({
  playableGames: state.playableGames,
  potentialGames: state.potentialGames,
  visible: state.potentialGamesAddModalVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  setPotentialGames(potentialGames: PotentialGame[]) {
    dispatch(setPotentialGames(potentialGames));
  },
  setPlayableGames(playableGames: PlayableGame[]) {
    dispatch(setPlayableGames(playableGames));
  },
  selectGame(playableGame: PlayableGame) {
    dispatch(selectGame(playableGame));
  },
  setPotentialGameToAdd(potentialGame: PotentialGame) {
    dispatch(setPotentialGameToAdd(potentialGame));
  },
  openGameAddModal() {
    dispatch(openGameAddModal());
  },
  closePotentialGamesAddModal() {
    dispatch(closePotentialGamesAddModal());
  }
});

const PotentialGamesAddModalContainer = injectIntl(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(PotentialGamesAddModal)
);

export { PotentialGamesAddModalContainer as PotentialGamesAddModal };
