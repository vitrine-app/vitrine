import { css, StyleSheet } from 'aphrodite';
import { margin } from 'css-verbose';
import * as React from 'react';
import { ContextMenu as ContextMenuDiv, MenuItem } from 'react-contextmenu';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Button, Modal, Transition } from 'semantic-ui-react';

import { GamesCollection } from '@models/GamesCollection';
import { PlayableGame } from '@models/PlayableGame';
import { Action } from '../redux/actions/actionsTypes';
import { launchGame, setGameToEdit } from '../redux/actions/games';
import { openGameAddModal, openTimePlayedEditionModal } from '../redux/actions/modals';
import { AppState } from '../redux/AppState';
import { serverListener } from '../serverListener';
import { VitrineComponent } from '../VitrineComponent';

interface Props {
  playableGames: GamesCollection<PlayableGame>;
  launchGame: (launchedGame: PlayableGame) => void;
  setGameToEdit: (gameToEdit: PlayableGame) => void;
  openGameAddModal: () => void;
  openTimePlayedEditionModal: () => void;
}

interface State {
  toDeleteGame: PlayableGame;
  confirmVisible: boolean;
  transitionVisible: boolean;
}

class ContextMenu extends VitrineComponent<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = {
      confirmVisible: false,
      toDeleteGame: null,
      transitionVisible: false
    };
  }

  private removeGame = () => {
    serverListener.send('remove-game', this.state.toDeleteGame.uuid);
    this.resetModalData();
  };

  private resetModalData = () => {
    this.setState(
      {
        confirmVisible: false
      },
      () => {
        setTimeout(() => {
          this.setState({
            toDeleteGame: null,
            transitionVisible: false
          });
        }, this.modalsTransitionDuration);
      }
    );
  };

  private contextAction = (action: string) => (event: any, data: any, target: HTMLElement) => {
    const gameUuid: string = target.children[0].id.replace('sidebar-game:', '');
    const game: PlayableGame = this.props.playableGames.getGame(gameUuid);

    switch (action) {
      case 'launch': {
        this.props.launchGame(game);
        break;
      }
      case 'edit': {
        this.props.setGameToEdit(game);
        this.props.openGameAddModal();
        break;
      }
      case 'editTime': {
        this.props.setGameToEdit(game);
        this.props.openTimePlayedEditionModal();
        break;
      }
      case 'delete': {
        this.setState({
          confirmVisible: true,
          toDeleteGame: game
        });
        break;
      }
    }
  };

  private animateModal = (startingAnimation: boolean) => () => {
    if (startingAnimation === this.state.confirmVisible) {
      this.setState({
        transitionVisible: this.state.confirmVisible
      });
    }
  };

  public render(): JSX.Element {
    return (
      <div>
        <ContextMenuDiv id={'sidebar-games-context-menu'}>
          <MenuItem onClick={this.contextAction('launch')}>
            <FormattedMessage id={'actions.playGame'} />
          </MenuItem>
          <MenuItem onClick={this.contextAction('edit')}>
            <FormattedMessage id={'actions.editGame'} />
          </MenuItem>
          <MenuItem onClick={this.contextAction('editTime')}>
            <FormattedMessage id={'actions.editTimePlayed'} />
          </MenuItem>
          <MenuItem divider={true} />
          <MenuItem onClick={this.contextAction('delete')}>
            <FormattedMessage id={'actions.deleteGame'} />
          </MenuItem>
        </ContextMenuDiv>
        <Transition
          animation={'fade down'}
          duration={this.modalsTransitionDuration}
          onStart={this.animateModal(true)}
          onComplete={this.animateModal(false)}
          visible={this.state.confirmVisible}
        >
          <Modal open={this.state.transitionVisible} onClose={this.resetModalData} className={css(styles.modal)}>
            <Modal.Header>
              <FormattedMessage id={'actions.removeGame'} />
            </Modal.Header>
            <Modal.Content className={css(styles.modalContent)}>
              <FormattedMessage
                id={'removeGameText'}
                values={{
                  br: <br />,
                  name: <strong>{this.state.toDeleteGame ? this.state.toDeleteGame.name : ''}</strong>
                }}
              />
            </Modal.Content>
            <Modal.Actions>
              <Button secondary={true} onClick={this.resetModalData}>
                <FormattedMessage id={'actions.cancel'} />
              </Button>
              <Button primary={true} onClick={this.removeGame}>
                <FormattedMessage id={'actions.confirm'} />
              </Button>
            </Modal.Actions>
          </Modal>
        </Transition>
      </div>
    );
  }
}

const styles: React.CSSProperties & any = StyleSheet.create({
  modal: {
    margin: margin((22).rem(), 'auto')
  },
  modalContent: {
    fontSize: 16
  }
});

const mapStateToProps = (state: AppState) => ({
  playableGames: state.playableGames
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  launchGame(launchedGame: PlayableGame) {
    dispatch(launchGame(launchedGame));
  },
  setGameToEdit(gameToEdit: PlayableGame) {
    dispatch(setGameToEdit(gameToEdit));
  },
  openGameAddModal() {
    dispatch(openGameAddModal());
  },
  openTimePlayedEditionModal() {
    dispatch(openTimePlayedEditionModal());
  }
});

const ContextMenuContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ContextMenu);

export { ContextMenuContainer as ContextMenu };
