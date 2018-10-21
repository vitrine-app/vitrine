import { css, StyleSheet } from 'aphrodite';
import * as chunk from 'chunk';
import { margin } from 'css-verbose';
import * as React from 'react';
import { InjectedIntl } from 'react-intl';
import { Grid } from 'semantic-ui-react';

import { GamesCollection } from '../../../models/GamesCollection';
import { PotentialGame } from '../../../models/PotentialGame';
import { BlurPicture } from './BlurPicture';
import { FadingModal } from './FadingModal';

import { faPlusCircle } from '@fortawesome/fontawesome-free-solid';
import { VitrineComponent } from './VitrineComponent';

interface Props {
  closePotentialGamesAddModal: () => void;
  intl: InjectedIntl;
  openGameAddModal: () => void;
  potentialGames: GamesCollection<PotentialGame>;
  setPotentialGameToAdd: (potentialGame: PotentialGame) => void;
  visible: boolean;
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
    const potentialGamesRows: PotentialGame[][] = chunk(this.props.potentialGames.getGames(), 6);
    return (
      <FadingModal
        onClose={this.props.closePotentialGamesAddModal}
        size={'large'}
        style={{ margin: margin(1..rem(), 'auto') }}
        title={this.props.intl.formatMessage({ id: 'actions.addGames' })}
        visible={this.props.visible}
      >
        <Grid columns={6}>
          {potentialGamesRows.map((potentialGamesRow: PotentialGame[], index: number) =>
            <Grid.Row className={css(styles.gamesRow)} key={index}>
              {potentialGamesRow.map((potentialGame: PotentialGame, index: number) =>
                <Grid.Column key={index}>
                  <div className={css(styles.coverWrapper)}>
                    <BlurPicture
                      background={potentialGame.details.cover}
                      clickHandler={this.gameCoverClick.bind(null, potentialGame)}
                      faIcon={faPlusCircle}
                      fontSize={55}
                    />
                  </div>
                  <p className={css(styles.potentialGameName)}>
                    {potentialGame.name}
                  </p>
                </Grid.Column>
              )}
            </Grid.Row>
          )}
        </Grid>
      </FadingModal>
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
  gamesRow: {
    textAlign: 'center',
    paddingTop: 20,
    paddingBottom: 20
  },
  potentialGameName: {
    fontSize: 17,
    marginTop: 6
  }
});
