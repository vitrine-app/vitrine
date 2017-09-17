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
import { AddPotentialGamesModal } from '../AddPotentialGamesModal/AddPotentialGamesModal';

export class Vitrine extends React.Component<any, any> {
	public constructor() {
		super();

		this.state = {
			playableGames: new GamesCollection<PlayableGame>(),
			potentialGames: new GamesCollection<PotentialGame>(),
			selectedGame: null,
			potentialGameToAdd: null
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
			$('#add-potential-games-modal').modal('hide');
		});
	}

	private removePlayableGame(event: Electron.Event, gameId: string) {
		let currentPlayableGames: GamesCollection<PlayableGame> = this.state.playableGames;
		currentPlayableGames.removeGame(gameId, (error, game: PlayableGame, index: number) => {
			if (error)
				throw new Error(error);
			let currentSelectedGame = this.state.selectedGame;
			if (currentPlayableGames.games.length) {
				if (index)
					currentSelectedGame = currentPlayableGames.games[index - 1];
				else
					currentSelectedGame = currentPlayableGames.games[index];
			}
			else
				currentSelectedGame = null;
			this.setState({
				playableGames: currentPlayableGames,
				selectedGame: currentSelectedGame
			});
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

	private potentialGameToAddUpdateHandler(potentialGame: PotentialGame) {
		this.setState({
			potentialGameToAdd: potentialGame
		}, () => {
			$('#add-game-modal').modal('show');
		});
	}

	public componentDidMount() {
		ipcRenderer.send('client.ready');
		ipcRenderer.on('server.add-playable-games', this.addPlayableGames.bind(this));
		ipcRenderer.on('server.add-playable-game', this.addPlayableGame.bind(this));
		ipcRenderer.on('server.remove-playable-game', this.removePlayableGame.bind(this));
		ipcRenderer.on('server.add-potential-games', this.addPotentialGames.bind(this));
	}

	public render(): JSX.Element {
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
				<AddGameModal
					potentialGameToAdd={ this.state.potentialGameToAdd }
				/>
				<AddPotentialGamesModal
					potentialGames={ this.state.potentialGames }
					potentialGameUpdateCallback={ this.potentialGameToAddUpdateHandler.bind(this) }
				/>
			</div>
		);
	}
}
