import * as React from 'react';
import { ipcRenderer } from 'electron';

import './Vitrine.scss';
import { TaskBar } from '../TaskBar/TaskBar';
import { SideBar } from '../SideBar/SideBar';
import { GameContainer } from '../GameContainer/GameContainer';
import { PotentialGame } from '../../../../models/PotentialGame';
import { PlayableGame } from '../../../../models/PlayableGame';
import { GamesCollection } from '../../../../models/GamesCollection';
import { AddGameModal } from '../AddGameModal/AddGameModal';

export class Vitrine extends React.Component<any, any> {
	public constructor() {
		super();

		this.state = {
			playableGames: new GamesCollection<PlayableGame>(),
			potentialGames: new GamesCollection<PotentialGame>(),
			selectedGame: null
		};
	}

	private addPlayableGames(event: Electron.Event, games: PlayableGame[]) {
		let currentPlayableGames: GamesCollection<PlayableGame> = this.state.playableGames;
		currentPlayableGames.addGames(new GamesCollection<PlayableGame>(games), () => {
			this.setState({
				playableGames:  currentPlayableGames
			});
		});
	}

	private addPlayableGame(event: Electron.Event, game: PlayableGame) {
		let currentPlayableGames: GamesCollection<PlayableGame> = this.state.playableGames;
		currentPlayableGames.addGame(game);
		this.setState({
			playableGames: currentPlayableGames
		}, () => {
			$('#add-game-modal').modal('hide');
		});
	}

	private addPotentialGames(event: Electron.Event, potentialGames: PotentialGame[]) {
		this.setState({
			potentialGames: new GamesCollection<PotentialGame>(potentialGames)
		});
	}

	private sideBarGameClickHandler(uuid: string) {
		this.state.playableGames.getGame(uuid).then((selectedGame: PlayableGame) => {
			this.setState({
				selectedGame: selectedGame
			});
		});
	}

	public componentDidMount() {
		ipcRenderer.send('client.ready');
		ipcRenderer.on('server.add-playable-games', this.addPlayableGames.bind(this));
		ipcRenderer.on('server.add-playable-game', this.addPlayableGame.bind(this));
		ipcRenderer.on('server.add-potential-games', this.addPotentialGames.bind(this));
	}

	public render() {
		return (
			<div id="vitrine-app" className="container-fluid full-height">
				<TaskBar
					potentialGames={ this.state.potentialGames }
				/>
				<SideBar
					playableGames={ this.state.playableGames }
					gameClickHandler={ this.sideBarGameClickHandler.bind(this) }
					selectedGame={ this.state.selectedGame }
				/>
				<GameContainer
					selectedGame={ this.state.selectedGame }
				/>
				<AddGameModal/>
			</div>
		);
	}
}
