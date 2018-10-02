import { css, StyleSheet } from 'aphrodite';
import { margin } from 'css-verbose';
import * as React from 'react';
import { Grid, Modal, Transition } from 'semantic-ui-react';

import { GamesCollection } from '../../../models/GamesCollection';
import { PotentialGame } from '../../../models/PotentialGame';
import { localizer } from '../Localizer';
import { BlurPicture } from './BlurPicture';

import { faPlusCircle } from '@fortawesome/fontawesome-free-solid';
import { VitrineComponent } from './VitrineComponent';

interface Props {
  potentialGames: GamesCollection<PotentialGame>;
  visible: boolean;
  setPotentialGameToAdd: (potentialGame: PotentialGame) => void;
  openGameAddModal: () => void;
  closePotentialGamesAddModal: () => void;
}

interface State {
  transitionVisible: boolean;
}

export class PotentialGamesAddModal extends VitrineComponent<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = {
      transitionVisible: true
    };

    this.gameCoverClick = this.gameCoverClick.bind(this);
    this.animateModal = this.animateModal.bind(this);
  }

  private gameCoverClick(potentialGame: PotentialGame) {
    this.props.setPotentialGameToAdd(potentialGame);
    this.props.closePotentialGamesAddModal();
    this.props.openGameAddModal();
  }

  private animateModal(startingAnimation: boolean) {
    if (startingAnimation === this.props.visible)
      this.setState({
        transitionVisible: this.props.visible
      });
  }

  public render(): JSX.Element {
    return (
      <Transition
        animation={'fade down'}
        duration={this.modalsTransitionDuration}
        onStart={this.animateModal.bind(this, true)}
        onComplete={this.animateModal.bind(this, false)}
        visible={this.props.visible}
      >
        <Modal
          open={this.state.transitionVisible}
          onClose={this.props.closePotentialGamesAddModal}
          className={css(styles.modal)}
        >
          <Modal.Header>{localizer.f('addGames')}</Modal.Header>
          <Modal.Content>
            <Grid>
              {this.props.potentialGames.map((potentialGame: PotentialGame, index: number) =>
                <Grid.Column width={3} key={index}>
                  <div className={css(styles.coverWrapper)}>
                    <BlurPicture
                      faIcon={faPlusCircle}
                      fontSize={55}
                      background={potentialGame.details.cover}
                      clickHandler={this.gameCoverClick.bind(null, potentialGame)}
                    />
                  </div>
                  <p className={css(styles.potentialGameName)}>
                    {potentialGame.name}
                  </p>
                </Grid.Column>
              )}
            </Grid>
          </Modal.Content>
        </Modal>
      </Transition>
    );
  }
}

const styles: React.CSSProperties & any = StyleSheet.create({
  modal: {
    margin: margin(3..rem(), 'auto'),
    cursor: 'default',
    userSelect: 'none'
  },
  coverWrapper: {
    height: 200
  },
  potentialGameName: {
    fontSize: 17,
    marginTop: 6
  }
});
