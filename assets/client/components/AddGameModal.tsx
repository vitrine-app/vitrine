import * as React from 'react';
import * as DateTime from 'react-datetime';
import { ipcRenderer, remote} from 'electron';
import { StyleSheet, css } from 'aphrodite';
import * as moment from 'moment';
import { rgba } from 'css-verbose';

import { VitrineComponent } from './VitrineComponent';
import { PotentialGame, GameSource } from '../../models/PotentialGame';
import { BlurPicture } from './BlurPicture';
import { NumberPicker } from './NumberPicker';
import { IgdbResearchModal } from './IgdbResearchModal';
import { ImagesCollection } from './ImagesCollection';
import { localizer } from '../Localizer';
import { openExecutableDialog, openImageDialog } from '../helpers';

export class AddGameModal extends VitrineComponent {
	private emptyState: any;

	public constructor(props: any) {
		super(props);

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
			backgroundScreen: '',
			potentialBackgrounds: [],
			source: GameSource.LOCAL,
			isEditing: props.isEditing
		};
		this.state = this.emptyState;
	}

	private fillIgdbGame(event: Electron.Event, gameInfos: any) {
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
			backgroundScreen: (gameInfos.screenshots.length) ? (gameInfos.screenshots[0]) : ('')
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

	private dateChangeHandler(date: moment.Moment) {
		this.setState({
			date: date.format('DD/MM/YYYY')
		});
	}

	private ratingChangeHandler(value: number) {
		this.setState({
			rating: value
		});
	}

	private executableBtnClickHandler() {
		let dialogRet: string = openExecutableDialog();
		if (!dialogRet)
			return;
		this.setState({
			executable: dialogRet
		});
	}

	private changeBackgroundHandler(imageUrl: string) {
		this.setState({
			backgroundScreen: imageUrl
		});
	}

	private searchIgdbBtnClickHandler() {
		$('#igdb-research-modal').modal('show');
		ipcRenderer.send('client.search-igdb-games', this.state.name);
	}

	private addGameBtnClickHandler() {
		let gameInfos: any = {...this.state};
		delete gameInfos.potentialBackgrounds;
		delete gameInfos.isEditing;
		if (gameInfos.cover && !gameInfos.cover.startsWith('http'))
			gameInfos.cover = `file://${gameInfos.cover}`;
		if (gameInfos.backgroundScreen && !gameInfos.backgroundScreen.startsWith('http'))
			gameInfos.backgroundScreen = `file://${gameInfos.backgroundScreen}`;

		if (this.state.isEditing)
			ipcRenderer.send('client.edit-game',this.props.potentialGameToAdd.uuid, gameInfos);
		else
			ipcRenderer.send('client.add-game', gameInfos);
	}

	public componentDidMount() {
		$('#add-game-modal').on('hidden.bs.modal', this.hideModalHandler.bind(this));
		ipcRenderer.on('server.send-igdb-game', this.fillIgdbGame.bind(this));
	}

	public componentWillReceiveProps(props: any) {
		if (props.potentialGameToAdd) {
			let gameToAdd: PotentialGame = props.potentialGameToAdd;
			let [executable, args] = gameToAdd.commandLine;

			this.setState({
				isEditing: props.isEditing,
				name: gameToAdd.name,
				cover: gameToAdd.details.cover,
				source: gameToAdd.source,
				executable: executable,
				arguments: args,
				series: (gameToAdd.details.series) ? (gameToAdd.details.series) : (''),
				date: (gameToAdd.details.releaseDate) ? (moment.unix(gameToAdd.details.releaseDate / 1000).format('DD/MM/YYYY')) : (''),
				developer: (gameToAdd.details.developer) ? (gameToAdd.details.developer) : (''),
				publisher: (gameToAdd.details.publisher) ? (gameToAdd.details.publisher) : (''),
				genres: (gameToAdd.details.genres) ? (gameToAdd.details.genres.join(', ')) : (''),
				rating: (gameToAdd.details.rating) ? (gameToAdd.details.rating) : (''),
				summary: (gameToAdd.details.summary) ? (gameToAdd.details.summary) : (''),
				potentialBackgrounds: (gameToAdd.details.backgroundScreen) ? ([gameToAdd.details.backgroundScreen]) : ([]),
				backgroundScreen: (gameToAdd.details.backgroundScreen) ? (gameToAdd.details.backgroundScreen) : ('')
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
								<button type="button" className="close" data-dismiss="modal"><i className="fa fa-times"/></button>
								<h4 className="modal-title">
									{(this.state.isEditing) ? (localizer.f('editGameLabel')) : (localizer.f('addGameLabel'))}
								</h4>
							</div>
							<div className={`modal-body ${css(styles.modalBody)}`}>
								<div className="row">
									<div className="col-md-2">
										<label className={css(styles.coverLabel)}>{localizer.f('coverLabel')}</label>
										<BlurPicture
											faIcon={'folder-open-o'}
											fontSize={55}
											background={this.state.cover}
											clickHandler={this.gameCoverClickHandler.bind(this)}
										/>
									</div>
									<div className="col-md-7 col-md-offset-1">
										<form className={css(styles.addGameForm)}>
											<div className="form-group">
												<label>{localizer.f('gameName')}</label>
												<input
													className="form-control"
													name="name"
													placeholder={localizer.f('gameName')}
													value={this.state.name}
													onChange={this.inputChangeHandler.bind(this)}
												/>
											</div>
											<div className="row">
												<div className="form-group col-md-8">
													<label>{localizer.f('gamesSeries')}</label>
													<input
														className="form-control"
														name="series"
														placeholder={localizer.f('gamesSeries')}
														value={this.state.series}
														onChange={this.inputChangeHandler.bind(this)}
													/>
												</div>
												<div className="form-group col-md-4">
													<label>{localizer.f('releaseDate')}</label>
													<DateTime
														value={this.state.date}
														dateFormat={'DD/MM/YYYY'}
														timeFormat={false}
														inputProps={{
															placeholder: localizer.f('releaseDate'),
															readOnly: true
														}}
														onChange={this.dateChangeHandler.bind(this)}
													/>
												</div>
											</div>
											<div className="row">
												<div className="form-group col-md-6">
													<label>{localizer.f('developer')}</label>
													<input
														className="form-control"
														name="developer"
														placeholder={localizer.f('developer')}
														value={this.state.developer}
														onChange={this.inputChangeHandler.bind(this)}
													/>
												</div>
												<div className="form-group col-md-6">
													<label>{localizer.f('publisher')}</label>
													<input
														className="form-control"
														name="publisher"
														placeholder={localizer.f('publisher')}
														value={this.state.publisher}
														onChange={this.inputChangeHandler.bind(this)}
													/>
												</div>
											</div>
											<div className="row">
												<div className="form-group col-md-10">
													<label>{localizer.f('genres')}</label>
													<input
														className="form-control"
														name="genres"
														placeholder={localizer.f('genres')}
														value={this.state.genres}
														onChange={this.inputChangeHandler.bind(this)}
													/>
												</div>
												<div className="form-group col-md-2">
													<label>{localizer.f('rating')}</label>
													<NumberPicker
														min={1}
														max={100}
														name="rating"
														placeholder={localizer.f('rating')}
														value={this.state.rating}
														onChange={this.ratingChangeHandler.bind(this)}
													/>
												</div>
											</div>
											<div className="form-group">
												<label>{localizer.f('summary')}</label>
												<textarea
													className={`form-control ${css(styles.formTextArea)}`}
													name="summary"
													placeholder={localizer.f('summary')}
													value={this.state.summary}
													onChange={this.inputChangeHandler.bind(this)}
												/>
											</div>
											<hr className={css(styles.formHr)}/>
											<div className="form-group">
												<label>{localizer.f('executable')}</label>
												<div className="input-group">
													<input
														className="form-control"
														name="executable"
														placeholder={localizer.f('executable')}
														value={this.state.executable}
														onChange={this.inputChangeHandler.bind(this)}
														readOnly={true}
														onClick={this.executableBtnClickHandler.bind(this)}
													/>
													<span className="input-group-btn">
														<button
															className="btn btn-default"
															type="button"
															onClick={this.executableBtnClickHandler.bind(this)}
														>
															<i className="fa fa-folder-open-o"/>
														</button>
													</span>
												</div>
											</div>
											<div className="form-group">
												<label>{localizer.f('lineArguments')}</label>
												<input
													className="form-control"
													name="arguments"
													placeholder={localizer.f('lineArguments')}
													value={this.state.arguments}
													onChange={this.inputChangeHandler.bind(this)}
												/>
											</div>
											<hr className={css(styles.formHr)}/>
											<div className="form-group">
												<label>{localizer.f('backgroundImage')}</label>
												<ImagesCollection
													images={this.state.potentialBackgrounds}
													onChange={this.changeBackgroundHandler.bind(this)}
												/>
											</div>
											<input
												name="cover"
												value={this.state.cover}
												onChange={this.inputChangeHandler.bind(this)}
												hidden
											/>
											<input
												name="background"
												value={this.state.backgroundScreen}
												onChange={this.inputChangeHandler.bind(this)}
												hidden
											/>
											<input
												name="source"
												value={this.state.source}
												onChange={this.inputChangeHandler.bind(this)}
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
									onClick={this.searchIgdbBtnClickHandler.bind(this)}
								>
									{localizer.f('fillWithIgdb')}
								</button>
								<button
									className="btn btn-primary"
									disabled={!this.state.name || !this.state.executable}
									type="button"
									onClick={this.addGameBtnClickHandler.bind(this)}
								>
									{(this.state.isEditing) ? (localizer.f('editGame')) : (localizer.f('submitNewGame'))}
								</button>
							</div>
						</div>
					</div>
				</div>
				{this.checkErrors()}
			</div>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	modalBody: {
		maxHeight: `${82}vh`,
		overflowY: 'auto'
	},
	formHr: {
		borderTop: `solid ${1}px ${rgba(238, 238, 238, 0.15)}`
	},
	formTextArea: {
		resize: 'none',
		height: `${7}em`
	},
	coverLabel: {
		paddingLeft: 40
	}
});
