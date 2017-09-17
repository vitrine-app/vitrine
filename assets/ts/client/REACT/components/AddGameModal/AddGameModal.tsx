import * as React from 'react';
import { ipcRenderer, remote } from 'electron';
import * as moment from 'moment';

import { PotentialGame, GameSource } from '../../../../models/PotentialGame';

import './AddGameModal.scss';
import { BlurPicture } from '../BlurPicture/BlurPicture';
import { NumberPicker } from '../NumberPicker/NumberPicker';
import { IgdbResearchModal } from '../IgdbResearchModal/IgdbResearchModal';
import { ImagesCollection } from '../ImagesCollection/ImagesCollection';
import { localizer } from '../../Localizer';
import { openImageDialog } from '../../../helpers';

export class AddGameModal extends React.Component<any, any> {
	private emptyState: any;

	public constructor() {
		super();

		this.emptyState = {
			name: '',
			series: '',
			date: '',
			developer: '',
			publisher: '',
			genres: '',
			rating: '',
			summary: '',
			executable: '',
			arguments: '',
			cover: '',
			background: '',
			potentialBackgrounds: [],
			source: GameSource.LOCAL
		};
		this.state = this.emptyState;
	}

	private fillIgdbGame(event: Electron.Event, error: string, gameInfos: any) {
		$('#igdb-research-modal').modal('hide');
		this.setState({
			name: gameInfos.name,
			series: gameInfos.series,
			date: moment.unix(gameInfos.releaseDate / 1000).format('DD/MM/YYYY'),
			developer: gameInfos.developer,
			publisher: gameInfos.publisher,
			genres: gameInfos.genres.join(', '),
			rating: gameInfos.rating,
			summary: gameInfos.summary,
			cover: gameInfos.cover,
			potentialBackgrounds: gameInfos.screenshots,
			background: (gameInfos.screenshots.length) ? (gameInfos.screenshots[0]) : ('')
		});
	}

	private hideModalHandler() {
		this.setState(this.emptyState);
	}

	private gameCoverClickHandler() {
		let cover: string = openImageDialog();
		if (cover)
			this.setState({
				cover: cover
			});
	}

	private inputChangeHandler(event: any) {
		let name: string = event.target.name;
		let value: string = event.target.value;

		this.setState({
			[name]: value
		});
	}

	private ratingChangeHandler(value: number) {
		this.setState({
			rating: value
		});
	}

	private executableBtnClickHandler() {
		let dialogRet: string[] = remote.dialog.showOpenDialog({
			properties: ['openFile'],
			filters: [
				{
					name: localizer.f('executables'),
					extensions: ['exe']
				},
				{
					name:localizer.f('allFiles'),
					extensions: ['*']
				}
			]
		});
		if (!dialogRet || !dialogRet.length)
			return;
		this.setState({
			executable: dialogRet[0]
		});
	}

	private changeBackgroundHandler(imageUrl: string) {
		this.setState({
			background: imageUrl
		});
	}

	private searchIgdbBtnClickHandler() {
		ipcRenderer.send('client.search-igdb-games', this.state.name);
	}

	private addGameBtnClickHandler() {
		let gameInfos: any = { ...this.state };
		delete gameInfos.potentialBackgrounds;
		ipcRenderer.send('client.add-game', gameInfos);
	}

	public componentDidMount() {
		$('#add-game-modal').on('hidden.bs.modal', this.hideModalHandler.bind(this));
		ipcRenderer.on('server.send-igdb-game', this.fillIgdbGame.bind(this));
	}

	public componentWillReceiveProps(props: any) {
		if (props.potentialGameToAdd) {
			let gameToAdd: PotentialGame = props.potentialGameToAdd;
			let args: string[] = gameToAdd.commandLine.slice();
			let executable: string = args.shift();

			this.setState({
				name: gameToAdd.name,
				cover: gameToAdd.details.cover,
				source: gameToAdd.source,
				executable: executable,
				arguments: args.join(' ')
			});
		}
	}

	public render(): JSX.Element {
		return (
			<div>
				<IgdbResearchModal/>
				<div id="add-game-modal" className="modal fade" role="dialog">
					<div className="modal-dialog modal-lg">
						<div className="modal-content">
							<div className="modal-header">
								<button type="button" className="close" data-dismiss="modal">&times;</button>
								<h4 className="modal-title">{ localizer.f('addGameLabel') }</h4>
							</div>
							<div className="modal-body">
								<div className="row">
									<div className="col-md-2">
										<BlurPicture
											faIcon={ 'folder-open-o' }
											fontSize={ 55 }
											background={ this.state.cover }
											clickHandler={ this.gameCoverClickHandler.bind(this) }
										/>
									</div>
									<div className="col-md-7 col-md-offset-1">
										<form id="add-game-form">
											<div className="form-group">
												<label>{ localizer.f('gameName') }</label>
												<input
													className="form-control"
													name="name"
													placeholder={ localizer.f('gameName') }
													value={ this.state.name }
													onChange={ this.inputChangeHandler.bind(this) }
												/>
											</div>
											<div className="row">
												<div className="form-group col-md-8">
													<label>{ localizer.f('gamesSeries') }</label>
													<input
														className="form-control"
														name="series"
														placeholder={ localizer.f('gamesSeries') }
														value={ this.state.series }
														onChange={ this.inputChangeHandler.bind(this) }
													/>
												</div>
												<div className="form-group col-md-4">
													<label>{ localizer.f('releaseDate') }</label>
													<input
														className="form-control"
														name="date"
														placeholder={ localizer.f('releaseDate') }
														value={ this.state.date }
														onChange={ this.inputChangeHandler.bind(this) }
													/>
												</div>
											</div>
											<div className="row">
												<div className="form-group col-md-6">
													<label>{ localizer.f('developer') }</label>
													<input
														className="form-control"
														name="developer"
														placeholder={ localizer.f('developer') }
														value={ this.state.developer }
														onChange={ this.inputChangeHandler.bind(this) }
													/>
												</div>
												<div className="form-group col-md-6">
													<label>{ localizer.f('publisher') }</label>
													<input
														className="form-control"
														name="publisher"
														placeholder={ localizer.f('publisher') }
														value={ this.state.publisher }
														onChange={ this.inputChangeHandler.bind(this) }
													/>
												</div>
											</div>
											<div className="row">
												<div className="form-group col-md-10">
													<label>{ localizer.f('genres') }</label>
													<input
														className="form-control"
														name="genres"
														placeholder={ localizer.f('genres') }
														value={ this.state.genres }
														onChange={ this.inputChangeHandler.bind(this) }
													/>
												</div>
												<div className="form-group col-md-2">
													<label>{ localizer.f('rating') }</label>
													<NumberPicker
														min={ 1 }
														max={ 100 }
														name="rating"
														placeholder={ localizer.f('rating') }
														value={ this.state.rating }
														onChange={ this.ratingChangeHandler.bind(this) }
													/>
												</div>
											</div>
											<div className="form-group">
												<label>{ localizer.f('summary') }</label>
												<textarea
													className="form-control"
													name="summary"
													placeholder={ localizer.f('summary') }
													value={ this.state.summary }
													onChange={ this.inputChangeHandler.bind(this) }
												/>
											</div>
											<hr/>
											<div className="form-group">
												<label>{ localizer.f('executable') }</label>
												<div className="input-group">
													<input
														className="form-control"
														name="executable"
														placeholder={ localizer.f('executable') }
														value={ this.state.executable }
														onChange={ this.inputChangeHandler.bind(this) }
														disabled
													/>
													<span className="input-group-btn">
													<button
														className="btn btn-default"
														type="button"
														onClick={ this.executableBtnClickHandler.bind(this) }
													>
														<i className="fa fa-folder-open-o"/>
													</button>
												</span>
												</div>
											</div>
											<div className="form-group">
												<label>{ localizer.f('lineArguments') }</label>
												<input
													className="form-control"
													name="arguments"
													placeholder={ localizer.f('lineArguments') }
													value={ this.state.arguments }
													onChange={ this.inputChangeHandler.bind(this) }
												/>
											</div>
											<hr/>
											<div className="form-group">
												<label>{ localizer.f('backgroundImage') }</label>
												<ImagesCollection
													images={ this.state.potentialBackgrounds }
													onChange={ this.changeBackgroundHandler.bind(this) }
												/>
											</div>
											<input
												name="cover"
												value={ this.state.cover }
												onChange={ this.inputChangeHandler.bind(this) }
												hidden
											/>
											<input
												name="background"
												value={ this.state.background }
												onChange={ this.inputChangeHandler.bind(this) }
												hidden
											/>
											<input
												name="source"
												value={ this.state.source }
												onChange={ this.inputChangeHandler.bind(this) }
												hidden
											/>
										</form>
									</div>
								</div>
							</div>
							<div className="modal-footer">
								<button
									id="igdb-search-btn"
									className="btn btn-primary"
									disabled={!this.state.name}
									onClick={ this.searchIgdbBtnClickHandler.bind(this) }
								>
									{ localizer.f('fillWithIgdb') }
								</button>
								<button
									className="btn btn-primary"
									disabled={!this.state.name || !this.state.executable}
									type="button"
									onClick={ this.addGameBtnClickHandler.bind(this) }
								>
									{ localizer.f('submitNewGame') }
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
