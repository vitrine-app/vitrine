import * as React from 'react';
import { ipcRenderer } from 'electron';

import './Vitrine.scss';

import { TaskBar } from '../TaskBar/TaskBar';
import { SideBar } from '../SideBar/SideBar';
import { GameContainer } from '../GameContainer/GameContainer';

import { PlayableGame } from '../../../../models/PlayableGame';
import { GamesCollection } from '../../../../models/GamesCollection';

export class Vitrine extends React.Component<any, any> {
	public constructor() {
		super();

		this.state = {
			playableGames: new GamesCollection(),
			selectedGame: null
		};
	}

	public render() {
		return (
			<div id="vitrine-app" className="container-fluid full-height">
				<TaskBar/>
				<SideBar
					playableGames={ this.state.playableGames }
					gameClickHandler={ this.sideBarGameClickHandler.bind(this) }
					selectedGame={ this.state.selectedGame }
				/>
				<GameContainer
					selectedGame={ this.state.selectedGame }
				/>
			</div>
		);
	}

	public componentDidMount() {
		ipcRenderer.send('client.ready');
		ipcRenderer.on('server.add-playable-games', this.addPlayableGames.bind(this));
	}

	private addPlayableGames(event: Electron.Event, games: PlayableGame[]) {
		this.setState({
			playableGames: new GamesCollection(games)
		});
	}

	private sideBarGameClickHandler(uuid: string) {
		this.state.playableGames.getGame(uuid).then((selectedGame: PlayableGame) => {
			this.setState({
				selectedGame: selectedGame
			});
		});
	}
}
