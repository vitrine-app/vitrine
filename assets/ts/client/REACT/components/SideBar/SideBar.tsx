import * as React from 'react';

import './SideBar.scss';
import { PlayableGame } from '../../../../models/PlayableGame';

export class SideBar extends React.Component<any, any> {
	public render() {
		return (
			<div id="sidebar-container" className="col-sm-4 col-lg-2">
				<div id="sidebar-content">
					<div id="potential-games-area"></div>
					<hr/>
					<div className="games-list">
						<ul id="playable-games-list" className="games-list">
							{ this.props.playableGames.games.map((game: PlayableGame) =>
								<li id={ 'game-' + game.uuid }
									key={ game.uuid }
									className={ (this.props.selectedGame && this.props.selectedGame.uuid === game.uuid) ? ('selected-game') : ('') }
									onClick={ this.clickGameHandler.bind(this) }
								>
									{ game.name }
								</li>
							) }
						</ul>
					</div>
				</div>
			</div>
		);
	}

	private clickGameHandler(event: any) {
		this.props.gameClickHandler(event.target.id.replace('game-', ''));
	}
}
