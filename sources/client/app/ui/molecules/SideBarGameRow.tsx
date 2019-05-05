import { css, StyleSheet } from 'aphrodite';
import { padding, rgba } from 'css-verbose';
import * as React from 'react';

import { PlayableGame } from '@models/PlayableGame';
import { ContextMenuTrigger } from 'react-contextmenu';

interface Props {
  clickGameHandler: (event: any) => void;
  game: PlayableGame;
  launchGame: (gameUuid: string) => () => void;
  selectedGame: PlayableGame;
}

export const SideBarGameRow: React.StatelessComponent<Props> = ({ clickGameHandler, game, launchGame, selectedGame }: Props) => (
  <ContextMenuTrigger id="sidebar-games-context-menu">
    <li
      id={`sidebar-game:${game.uuid}`}
      className={`${css(styles.gameRow)}${selectedGame && selectedGame.uuid === game.uuid ? ' ' + css(styles.selectedGameRow) : ''}`}
      onClick={clickGameHandler}
      onDoubleClick={launchGame(game.uuid)}
    >
      {game.name}
    </li>
  </ContextMenuTrigger>
);

const styles: React.CSSProperties & any = StyleSheet.create({
  gameRow: {
    ':hover': {
      backgroundColor: rgba(150, 136, 116, 0.13),
      color: '#AFACA7',
      transition: `${66}ms`
    },
    color: rgba(175, 172, 167, 0.64),
    cursor: 'pointer',
    display: 'block',
    fontSize: 14,
    overflowX: 'hidden',
    padding: padding(10, 20, 10),
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  selectedGameRow: {
    backgroundColor: rgba(175, 153, 124, 0.14),
    color: '#AFACA7',
    fontWeight: 600,
    paddingLeft: 30,
    paddingRight: 10,
    transition: `${250}ms`
  }
});
