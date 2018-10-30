import { css, StyleSheet } from 'aphrodite';
import { margin } from 'css-verbose';
import * as React from 'react';
import { ContextMenu as ContextMenuDiv, MenuItem } from 'react-contextmenu';
import { FormattedMessage } from 'react-intl';
import { Button, Modal, Transition } from 'semantic-ui-react';

import { GamesCollection } from '../../../models/GamesCollection';
import { PlayableGame } from '../../../models/PlayableGame';
import { serverListener } from '../ServerListener';
import { VitrineComponent } from './VitrineComponent';

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

export class ContextMenu extends VitrineComponent<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = {
      toDeleteGame: null,
      confirmVisible: false,
      transitionVisible: false
    };

    this.removeGame = this.removeGame.bind(this);
    this.resetModalData = this.resetModalData.bind(this);
    this.launchClick = this.launchClick.bind(this);
    this.editClick = this.editClick.bind(this);
    this.editTimeClick = this.editTimeClick.bind(this);
    this.deleteClick = this.deleteClick.bind(this);
    this.animateModal = this.animateModal.bind(this);
  }

  private launchClick(event: any, data: any, target: HTMLElement) {
    this.contextAction(target, 'launch');
  }

  private editClick(event: any, data: any, target: HTMLElement) {
    this.contextAction(target, 'edit');
  }

  private editTimeClick(event: any, data: any, target: HTMLElement) {
    this.contextAction(target, 'editTime');
  }

  private deleteClick(event: any, data: any, target: HTMLElement) {
    this.contextAction(target, 'delete');
  }

  private removeGame() {
    serverListener.send('remove-game', this.state.toDeleteGame.uuid);
    this.resetModalData();
  }

  private resetModalData() {
    this.setState({
      confirmVisible: false
    }, () => {
      setTimeout(() => {
        this.setState({
          toDeleteGame: null,
          transitionVisible: false
        });
      }, this.modalsTransitionDuration);
    });
  }

  private contextAction(target: HTMLElement, action: string) {
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
  }

  private animateModal(startingAnimation: boolean) {
    if (startingAnimation === this.state.confirmVisible)
      this.setState({
        transitionVisible: this.state.confirmVisible
      });
  }

  public render(): JSX.Element {
    return (
      <div>
        <ContextMenuDiv id={'sidebar-games-context-menu'}>
          <MenuItem onClick={this.launchClick}>
            <FormattedMessage id={'actions.playGame'}/>
          </MenuItem>
          <MenuItem onClick={this.editClick}>
            <FormattedMessage id={'actions.editGame'}/>
          </MenuItem>
          <MenuItem onClick={this.editTimeClick}>
            <FormattedMessage id={'actions.editTimePlayed'}/>
          </MenuItem>
          <MenuItem divider={true}/>
          <MenuItem onClick={this.deleteClick}>
            <FormattedMessage id={'actions.deleteGame'}/>
          </MenuItem>
        </ContextMenuDiv>
        <Transition
          animation={'fade down'}
          duration={this.modalsTransitionDuration}
          onStart={this.animateModal.bind(this, true)}
          onComplete={this.animateModal.bind(this, false)}
          visible={this.state.confirmVisible}
        >
          <Modal
            open={this.state.transitionVisible}
            onClose={this.resetModalData}
            className={css(styles.modal)}
          >
            <Modal.Header><FormattedMessage id={'actions.removeGame'}/></Modal.Header>
            <Modal.Content
              className={css(styles.modalContent)}
            >
              <FormattedMessage
                id={'removeGameText'}
                values={{ name: <strong>{this.state.toDeleteGame ? this.state.toDeleteGame.name : ''}</strong>, br: <br/> }}
              />
            </Modal.Content>
            <Modal.Actions>
              <Button
                secondary={true}
                onClick={this.resetModalData}
              >
                <FormattedMessage id={'actions.cancel'}/>
              </Button>
              <Button
                primary={true}
                onClick={this.removeGame}
              >
                <FormattedMessage id={'actions.confirm'}/>
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
    margin: margin(22..rem(), 'auto')
  },
  modalContent: {
    fontSize: 16
  }
});
