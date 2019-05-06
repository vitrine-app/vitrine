import { css, StyleSheet } from 'aphrodite';
import { margin, padding } from 'css-verbose';
import * as React from 'react';
import { InjectedIntl, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Button, Dropdown, Grid } from 'semantic-ui-react';

import { faCogs, faPlus, faSyncAlt } from '@fortawesome/fontawesome-free-solid';
import { GamesCollection } from '@models/GamesCollection';
import { PlayableGame, SortParameter } from '@models/PlayableGame';
import { PotentialGame } from '@models/PotentialGame';
import { ActionButton } from '../../ui/ActionButton';
import { SideBarGameRow } from '../../ui/molecules';
import { Action } from '../redux/actions/actionsTypes';
import { refreshGames, selectGame, sortGames } from '../redux/actions/games';
import { openGameAddModal, openPotentialGamesAddModal, openSettingsModal } from '../redux/actions/modals';
import { AppState } from '../redux/AppState';
import { serverListener } from '../serverListener';
import { VitrineComponent } from '../VitrineComponent';
import { ContextMenu } from './ContextMenu';

interface Props {
  potentialGames: GamesCollection<PotentialGame>;
  playableGames: GamesCollection<PlayableGame>;
  selectedGame: PlayableGame;
  refreshingGames: boolean;
  gamesSortParameter: SortParameter;
  intl: InjectedIntl;
  selectGame: (selectedGame: PlayableGame) => void;
  sortGames: (gamesSortParameter: SortParameter) => void;
  refreshGames: () => void;
  openGameAddModal: () => void;
  openPotentialGamesAddModal: () => void;
  openSettingsModal: () => void;
  launchGame: (gameUuid: string) => () => void;
}

class SideBar extends VitrineComponent<Props, {}> {
  private readonly gamesSortParameters: any[];

  public constructor(props: Props) {
    super(props);

    this.gamesSortParameters = [
      {
        parameter: SortParameter.NAME,
        text: 'sort.byName'
      },
      {
        parameter: SortParameter.TIME_PLAYED,
        text: 'sort.byTimePlayed'
      },
      {
        parameter: SortParameter.RELEASE_DATE,
        text: 'sort.byReleaseDate'
      },
      {
        parameter: SortParameter.RATING,
        text: 'sort.byRating'
      },
      {
        parameter: SortParameter.SERIES,
        text: 'sort.bySeries'
      },
      {
        parameter: SortParameter.DEVELOPER,
        text: 'sort.byDeveloper'
      },
      {
        parameter: SortParameter.PUBLISHER,
        text: 'sort.byPublisher'
      }
    ];
  }

  public componentDidMount() {
    serverListener.listen('potential-games-search-begin', () => {
      this.props.refreshGames();
    });
  }

  private static taskBarRefreshBtnClickHandler() {
    serverListener.send('refresh-potential-games');
  }

  private clickGameHandler = (event: any) => {
    const selectedGame: PlayableGame = this.props.playableGames.getGame(event.target.id.replace('sidebar-game:', ''));
    this.props.selectGame(selectedGame);
  };

  private sortGames = (sortParameter: SortParameter) => () => {
    this.props.sortGames(sortParameter);
  };

  public render() {
    const sideBarMenu: JSX.Element = (
      <Grid className={css(styles.sideBarMenu)}>
        <Grid.Column width={10} className={css(styles.sideBarColumn)}>
          <Grid className={css(styles.sideBarGrid)}>
            <Grid.Column className={css(styles.actionButton)}>
              <ActionButton icon={faPlus} tooltip={this.props.intl.formatMessage({ id: 'actions.addGame' })} onClick={this.props.openGameAddModal} />
            </Grid.Column>
            <Grid.Column className={css(styles.actionButton)}>
              <ActionButton
                icon={faSyncAlt}
                spin={this.props.refreshingGames}
                tooltip={this.props.intl.formatMessage({ id: 'actions.refresh' })}
                onClick={SideBar.taskBarRefreshBtnClickHandler}
              />
            </Grid.Column>
            <Grid.Column className={css(styles.actionButton)}>
              <ActionButton
                icon={faCogs}
                tooltip={this.props.intl.formatMessage({ id: 'settings.settings' })}
                onClick={this.props.openSettingsModal}
              />
            </Grid.Column>
          </Grid>
        </Grid.Column>
        <Grid.Column width={6} className={css(styles.sideBarColumn)}>
          <Grid className={css(styles.sideBarGrid)}>
            <Grid.Column width={10} className={css(styles.sideBarColumn)}>
              <Button
                primary={true}
                className={css(styles.addGamesButton)}
                style={{ visibility: this.props.potentialGames.size() ? 'visible' : 'hidden' }}
                onClick={this.props.openPotentialGamesAddModal}
              >
                {this.props.potentialGames.size()}
              </Button>
            </Grid.Column>
            <Grid.Column width={6} className={css(styles.sideBarColumn)}>
              <Dropdown className={css(styles.sortDropdown)} style={{ display: this.props.playableGames.size() ? 'block' : 'none' }}>
                <Dropdown.Menu>
                  <Dropdown.Header icon="sort numeric ascending" content={this.props.intl.formatMessage({ id: 'sort.sortGames' })} />
                  {this.gamesSortParameters.map((gamesSortParameter: any, index: number) => (
                    <Dropdown.Item
                      key={index}
                      text={this.props.intl.formatMessage({ id: gamesSortParameter.text })}
                      icon={gamesSortParameter.parameter === this.props.gamesSortParameter ? 'check' : ''}
                      onClick={this.sortGames(gamesSortParameter.parameter)}
                    />
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Grid.Column>
          </Grid>
        </Grid.Column>
      </Grid>
    );

    return (
      <Grid.Column className={css(styles.sideBarWrapper)}>
        {sideBarMenu}
        <div className={css(styles.sideBarContent)}>
          <ul className={css(styles.gamesListUl)}>
            {this.props.playableGames.map((game: PlayableGame, index: number) => (
              <SideBarGameRow
                clickGameHandler={this.clickGameHandler}
                game={game}
                key={index}
                launchGame={this.props.launchGame}
                selectedGame={this.props.selectedGame}
              />
            ))}
          </ul>
        </div>
        <ContextMenu />
      </Grid.Column>
    );
  }
}

const styles: React.CSSProperties & any = StyleSheet.create({
  actionButton: {
    padding: 0,
    width: (33.25).percents()
  },
  addGamesButton: {
    margin: margin((5).percents(), (16).percents())
  },
  gamesListUl: {
    height: (100).percents(),
    listStyleType: 'none',
    margin: margin(0),
    padding: padding(0)
  },
  sideBarColumn: {
    padding: 0
  },
  sideBarContent: {
    backgroundColor: '#292724',
    height: `calc(${(100).percents()} - ${(45).px()})`,
    overflowX: 'hidden',
    overflowY: 'auto'
  },
  sideBarGrid: {
    height: (100).percents(),
    margin: 0,
    width: (100).percents()
  },
  sideBarMenu: {
    height: 45,
    margin: 0,
    width: (100).percents()
  },
  sideBarWrapper: {
    backgroundColor: '#23211F',
    height: (100).percents(),
    padding: padding(25, 0, 0, 0),
    width: (15.5).percents()
  },
  sortDropdown: {
    marginTop: (30).percents()
  }
});

const mapStateToProps = (state: AppState) => ({
  gamesSortParameter: state.gamesSortParameter,
  playableGames: state.playableGames,
  potentialGames: state.potentialGames,
  refreshingGames: state.refreshingGames,
  selectedGame: state.selectedGame
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  selectGame(selectedGame: PlayableGame) {
    dispatch(selectGame(selectedGame));
  },
  refreshGames() {
    dispatch(refreshGames());
  },
  sortGames(gamesSortParameter: SortParameter) {
    dispatch(sortGames(gamesSortParameter));
  },
  openGameAddModal() {
    dispatch(openGameAddModal());
  },
  openPotentialGamesAddModal() {
    dispatch(openPotentialGamesAddModal());
  },
  openSettingsModal() {
    dispatch(openSettingsModal());
  }
});

const SideBarContainer = injectIntl(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SideBar)
);

export { SideBarContainer as SideBar };
