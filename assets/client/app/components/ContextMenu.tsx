import * as React from 'react';
import { ContextMenu as ContextMenuDiv, MenuItem } from 'react-contextmenu';

import { VitrineComponent } from './VitrineComponent';
import { GamesCollection } from '../../../models/GamesCollection';
import { PlayableGame } from '../../../models/PlayableGame';
import { localizer } from '../Localizer';

interface Props {
	playableGames: GamesCollection<PlayableGame>
	launchGame: (launchedGame: PlayableGame) => void,
	removePlayableGame: (gameUuid: string, selectedGame: PlayableGame) => void
}

export class ContextMenu extends VitrineComponent<Props, {}> {
	private contextAction(target: HTMLElement, action: string) {
		let gameUuid: string = target.children[0].id.replace('sidebar-game:', '');
		let game: PlayableGame = this.props.playableGames.getGame(gameUuid);

		switch (action) {
			case 'launch': {
				this.props.launchGame(game);
				break;
			}
			case 'edit': {
				//this.props.editGame(gameUuid);
				break;
			}
			case 'delete': {
				this.props.removePlayableGame(gameUuid, (this.props.playableGames.size() - 1) ? (this.props.playableGames.getGame(0)) : (null));
				break;
			}
		}
	}

	public render(): JSX.Element {
		return (
			<ContextMenuDiv id="sidebar-games-context-menu">
				<MenuItem onClick={(event: any, data: any, target: HTMLElement) => this.contextAction(target, 'launch')}>
					{localizer.f('play')}
				</MenuItem>
				<MenuItem onClick={(event: any, data: any, target: HTMLElement) => this.contextAction(target, 'edit')}>
					{localizer.f('edit')}
				</MenuItem>
				<MenuItem onClick={() => {}}>
					{localizer.f('editTimePlayed')}
				</MenuItem>
				<MenuItem divider={true}/>
				<MenuItem onClick={(event: any, data: any, target: HTMLElement) => this.contextAction(target, 'delete')}>
					{localizer.f('delete')}
				</MenuItem>
			</ContextMenuDiv>
		);
	}
}
