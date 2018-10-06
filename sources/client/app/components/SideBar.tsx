import { css, StyleSheet } from 'aphrodite';
import { margin, padding, rgba } from 'css-verbose';
import * as React from 'react';
import { ContextMenuTrigger } from 'react-contextmenu';
import { InjectedIntl } from 'react-intl';
import { Button, Dropdown, Grid } from 'semantic-ui-react';

import { faCogs, faPlus, faSyncAlt } from '@fortawesome/fontawesome-free-solid';
import { GamesCollection } from '../../../models/GamesCollection';
import { PlayableGame, SortParameter } from '../../../models/PlayableGame';
import { PotentialGame } from '../../../models/PotentialGame';
import { ContextMenu } from '../containers/ContextMenu';
import { serverListener } from '../ServerListener';
import { ActionButton } from './ActionButton';
import { VitrineComponent } from './VitrineComponent';

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
  launchGame: (gameUuid: string) => void;
}

export class SideBar extends VitrineComponent<Props, {}> {
  private readonly gamesSortParameters: any[];

  public constructor(props: Props) {
    super(props);

    this.gamesSortParameters = [
      {
        parameter: SortParameter.NAME,
        text: 'sortByName'
      },
      {
        parameter: SortParameter.TIME_PLAYED,
        text: 'sortByTimePlayed'
      },
      {
        parameter: SortParameter.RELEASE_DATE,
        text: 'sortByReleaseDate'
      },
      {
        parameter: SortParameter.RATING,
        text: 'sortByRating'
      },
      {
        parameter: SortParameter.SERIES,
        text: 'sortBySeries'
      },
      {
        parameter: SortParameter.DEVELOPER,
        text: 'sortByDeveloper'
      },
      {
        parameter: SortParameter.PUBLISHER,
        text: 'sortByPublisher'
      }
    ];

    this.clickGameHandler = this.clickGameHandler.bind(this);
    this.taskBarRefreshBtnClickHandler = this.taskBarRefreshBtnClickHandler.bind(this);
    this.potentialGamesButton = this.potentialGamesButton.bind(this);
  }

  private clickGameHandler(event: any) {
    const selectedGame: PlayableGame = this.props.playableGames.getGame(event.target.id.replace('sidebar-game:', ''));
    this.props.selectGame(selectedGame);
  }

  private taskBarRefreshBtnClickHandler() {
    serverListener.send('refresh-potential-games');
  }

  private potentialGamesButton() {
    this.props.openPotentialGamesAddModal();
  }

  public componentDidMount() {
    serverListener.listen('potential-games-search-begin', () => {
      this.props.refreshGames();
    });
  }

  public render() {
    const sideBarMenu: JSX.Element = (
      <Grid className={css(styles.sideBarMenu)}>
        <Grid.Column width={10} className={css(styles.sideBarColumn)}>
          <Grid className={css(styles.sideBarGrid)}>
            <Grid.Column className={css(styles.actionButton)}>
              <ActionButton
                icon={faPlus}
                tooltip={this.props.intl.formatMessage({ id: 'addGameLabel' })}
                onClick={this.props.openGameAddModal}
              />
            </Grid.Column>
            <Grid.Column className={css(styles.actionButton)}>
              <ActionButton
                icon={faSyncAlt}
                spin={this.props.refreshingGames}
                tooltip={this.props.intl.formatMessage({ id: 'refreshLabel' })}
                onClick={this.taskBarRefreshBtnClickHandler}
              />
            </Grid.Column>
            <Grid.Column className={css(styles.actionButton)}>
              <ActionButton
                icon={faCogs}
                tooltip={this.props.intl.formatMessage({ id: 'settings' })}
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
                style={{ visibility: (this.props.potentialGames.size()) ? ('visible') : ('hidden') }}
                onClick={this.potentialGamesButton}
              >
                {this.props.potentialGames.size()}
              </Button>
            </Grid.Column>
            <Grid.Column width={6} className={css(styles.sideBarColumn)}>
              <Dropdown
                className={css(styles.sortDropdown)}
                style={{ display: (this.props.playableGames.size()) ? ('block') : ('none') }}
              >
                <Dropdown.Menu>
                  <Dropdown.Header icon='sort numeric ascending' content={this.props.intl.formatMessage({ id: 'sortGames' })}/>
                  {this.gamesSortParameters.map((gamesSortParameter: any, index: number) => (
                    <Dropdown.Item
                      key={index}
                      text={this.props.intl.formatMessage({ id: gamesSortParameter.text })}
                      icon={(gamesSortParameter.parameter === this.props.gamesSortParameter) ? ('check') : ('')}
                      onClick={this.props.sortGames.bind(null, gamesSortParameter.parameter)}
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
                <ContextMenuTrigger
                  id='sidebar-games-context-menu'
                  key={index}
                >
                  <li
                    id={`sidebar-game:${game.uuid}`}
                    className={
                      css(styles.gamesListLi) +
                      ((this.props.selectedGame && this.props.selectedGame.uuid === game.uuid) ? (' ' + css(styles.selectedGame)) : (''))
                    }
                    onClick={this.clickGameHandler}
                    onDoubleClick={this.props.launchGame.bind(null, game.uuid)}
                  >
                    {game.name}
                  </li>
                </ContextMenuTrigger>
              )
            )}
          </ul>
        </div>
        <ContextMenu/>
      </Grid.Column>
    );
  }
}

const styles: React.CSSProperties & any = StyleSheet.create({
  sideBarWrapper: {
    padding: 0,
    width: 15.5.percents(),
    height: 100..percents(),
    backgroundColor: '#23211F'
  },
  sideBarMenu: {
    width: 100..percents(),
    margin: 0,
    height: 45
  },
  sideBarColumn: {
    padding: 0
  },
  sideBarGrid: {
    width: 100..percents(),
    height: 100..percents(),
    margin: 0
  },
  actionButton: {
    padding: 0,
    width: 33.25.percents()
  },
  addGamesButton: {
    margin: margin(5..percents(), 16..percents())
  },
  sortDropdown: {
    marginTop: 30..percents()
  },
  sideBarContent: {
    height: `calc(${100..percents()} - ${45..px()})`,
    overflowX: 'hidden',
    overflowY: 'auto',
    backgroundColor: '#292724'
  },
  gamesListUl: {
    height: 100..percents(),
    listStyleType: 'none',
    padding: padding(0),
    margin: margin(0)
  },
  gamesListLi: {
    display: 'block',
    fontSize: 15,
    color: '#A5A5A5',
    padding: padding(10, 20, 10),
    cursor: 'pointer',
    ':hover': {
      backgroundColor: rgba(150, 136, 116, 0.13),
      color: '#AFACA7',
      transition: `${66}ms`
    }
  },
  selectedGame: {
    backgroundColor: rgba(175, 153, 124, 0.14),
    color: '#AFACA7',
    fontWeight: 600,
    paddingLeft: 30,
    paddingRight: 10,
    transition: `${250}ms`
  }
});
