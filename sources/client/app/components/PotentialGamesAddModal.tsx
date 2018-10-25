import { css, StyleSheet } from 'aphrodite';
import * as chunk from 'chunk';
import { margin, padding } from 'css-verbose';
import * as React from 'react';
import { FormattedMessage, InjectedIntl } from 'react-intl';
import { Button, Grid, Progress } from 'semantic-ui-react';

import { GamesCollection } from '../../../models/GamesCollection';
import { PotentialGame } from '../../../models/PotentialGame';
import { serverListener } from '../ServerListener';
import { BlurPicture } from './BlurPicture';
import { FadingModal } from './FadingModal';
import { VitrineComponent } from './VitrineComponent';

import { faPlusCircle } from '@fortawesome/fontawesome-free-solid';
import * as lessVars from 'less-vars-loader?camelCase&resolveVariables!../../resources/less/theme/globals/site.variables';

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
  modalSize: 'fullscreen' | 'large' | 'mini' | 'small' | 'tiny';
  addAllGames: boolean;
}

export class PotentialGamesAddModal extends VitrineComponent<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = {
      transitionVisible: true,
      addAllGames: false,
      modalSize: 'large'
    };

    this.gameCoverClick = this.gameCoverClick.bind(this);
    this.animateModal = this.animateModal.bind(this);
    this.addAllGamesClick = this.addAllGamesClick.bind(this);
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

  private addAllGamesClick() {
    this.setState({ addAllGames: true });
    serverListener.send('add-all-games');
  }

  public render(): JSX.Element {
    const potentialGamesRows: PotentialGame[][] = chunk(this.props.potentialGames.getGames(), 6);
    const potentialGamesGrid: JSX.Element = (
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
    );
    const firstGameName: string = this.props.potentialGames.size() ? this.props.potentialGames.getGame(0).name : '';
    const allGamesProgressBar = (
      <React.Fragment>
        <p><FormattedMessage id={'allGamesDisclaimer'}/></p>
        <Progress color={'orange'} percent={55} active={true}>
          <FormattedMessage id={'actions.gameBeingAdded'} values={{ name: firstGameName }}/>
        </Progress>
      </React.Fragment>
    );
    return (
      <FadingModal
        onClose={this.props.closePotentialGamesAddModal}
        size={this.state.addAllGames ? 'mini' : 'large'}
        style={{ margin: margin(1..rem(), 'auto') }}
        title={this.state.addAllGames ? this.props.intl.formatMessage({ id: 'actions.addAllPotentialGames' }) : {
          title: this.props.intl.formatMessage({ id: 'actions.addGames' }),
          rightElement:
            <Button
              primary={true}
              className={css(styles.addAllGamesButton)}
              onClick={this.addAllGamesClick}
            >
              <FormattedMessage id={'actions.addAllPotentialGames'}/>
            </Button>
        }}
        visible={this.props.visible}
      >
        {this.state.addAllGames ? allGamesProgressBar : potentialGamesGrid}
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
  addAllGamesButton: {
    float: 'right'
  },
  coverWrapper: {
    height: 200,
    padding: padding(0, 10)
  },
  gamesRow: {
    textAlign: 'center',
    paddingTop: 20,
    paddingBottom: 20
  },
  potentialGameName: {
    fontSize: 17,
    marginTop: 6
  },
  progressBar: {
    backgroundColor: lessVars.primaryColor
  }
});
