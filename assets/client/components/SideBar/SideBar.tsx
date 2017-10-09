import * as React from 'react';
import { ipcRenderer } from 'electron';
import { ContextMenuTrigger } from 'react-contextmenu';

import { VitrineComponent } from '../VitrineComponent';
import './SideBar.scss';
import { PlayableGame } from '../../../models/PlayableGame';
import { launchGame } from '../../helpers';

export class SideBar extends VitrineComponent {
	public constructor(props: any) {
		super(props);

		this.state = {
			playableGames: props.playableGames
		}
	}

	private clickGameHandler(event: any) {
		this.props.gameClickHandler(event.target.id.replace('game-', ''));
	}

	public componentWillReceiveProps(props: any) {
		this.setState({
			playableGames: props.playableGames
		});
	}

	public render(): JSX.Element {
		return (
			<div id="sidebar-container" className="col-sm-4 col-lg-2">
				<div id="sidebar-content">
					<div className="games-list">
						<ul id="playable-games-list" className="games-list">
							{ this.state.playableGames.games.map((game: PlayableGame, index: number) =>
								<ContextMenuTrigger
									id="sidebar-games-context-menu"
									key={ index }
								>
									<li
										id={ 'game-' + game.uuid }
										className={ (this.props.selectedGame && this.props.selectedGame.uuid === game.uuid) ? ('selected-game') : ('') }
										onClick={ this.clickGameHandler.bind(this) }
										onDoubleClick={ launchGame.bind(null, game.uuid) }
										onKeyDown={ (e) => {console.log(e)}}
									>
										{ game.name }
									</li>
								</ContextMenuTrigger>
							) }
						</ul>
					</div>
				</div>
				{ this.checkErrors() }
			</div>
		);
	}
}
