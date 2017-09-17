import * as React from 'react';
import { ipcRenderer } from 'electron';
import { ContextMenuTrigger } from 'react-contextmenu';

import './SideBar.scss';
import { PlayableGame } from '../../../../models/PlayableGame';

export class SideBar extends React.Component<any, any> {
	private clickGameHandler(event: any) {
		this.props.gameClickHandler(event.target.id.replace('game-', ''));
	}

	public render(): JSX.Element {
		return (
			<div id="sidebar-container" className="col-sm-4 col-lg-2">
				<div id="sidebar-content">
					<div className="games-list">
						<ul id="playable-games-list" className="games-list">
							{ this.props.playableGames.games.map((game: PlayableGame, index: number) =>
								<ContextMenuTrigger
									id="sidebar-games-context-menu"
									key={ index }
								>
									<li
										id={ 'game-' + game.uuid }
										className={ (this.props.selectedGame && this.props.selectedGame.uuid === game.uuid) ? ('selected-game') : ('') }
										onClick={ this.clickGameHandler.bind(this) }
									>
										{ game.name }
									</li>
								</ContextMenuTrigger>
							) }
						</ul>
					</div>
				</div>
			</div>
		);
	}
}
