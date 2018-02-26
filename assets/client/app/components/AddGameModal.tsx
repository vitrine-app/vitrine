import * as React from 'react';
import { Button, Form, Grid, Input, Modal, TextArea } from 'semantic-ui-react';
import { StyleSheet, css } from 'aphrodite';
import * as moment from 'moment';
import { border, margin, rgba } from 'css-verbose';
import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';

import { VitrineComponent } from './VitrineComponent';
import { PotentialGame, GameSource } from '../../../models/PotentialGame';
import { serverListener } from '../ServerListener';
import { IgdbResearchModal } from '../containers/IgdbResearchModal';
import { BlurPicture } from './BlurPicture';
import { NumberPicker } from './NumberPicker';
import { DatePicker } from './DatePicker';
import { ImagesCollection } from './ImagesCollection';
import { localizer } from '../Localizer';
import { openExecutableDialog, openImageDialog } from '../helpers';

import { faFolderOpen } from '@fortawesome/fontawesome-free-solid';
import { PlayableGame } from '../../../models/PlayableGame';

interface Props {
	potentialGameToAdd: PotentialGame,
	visible: boolean,
	addPlayableGames: (playableGames: PlayableGame[]) => void,
	openAddGameModal: () => void,
	closeAddGameModal: () => void,
	openIgdbModal: () => void,
	closeIgdbModal: () => void,
	isEditing: boolean
}

interface State {
	name: string,
	series: string,
	date: string,
	developer: string,
	publisher: string,
	genres: string,
	rating: number,
	summary: string,
	executable: string,
	arguments: string,
	cover: string,
	backgroundScreen: string,
	potentialBackgrounds: string[],
	source: GameSource,
	isEditing: boolean
}

export class AddGameModal extends VitrineComponent<Props, State> {
	private emptyState: State;

	public constructor(props: Props) {
		super(props);

		this.emptyState = {
			name: '',
			series: '',
			date: '',
			developer: '',
			publisher: '',
			genres: '',
			rating: undefined,
			summary: '',
			executable: '',
			arguments: '',
			cover: '',
			backgroundScreen: '',
			potentialBackgrounds: [],
			source: GameSource.LOCAL,
			isEditing: props.isEditing
		};
		this.state = { ...this.emptyState };
	}

	private fillIgdbGame(gameInfos: any) {
		this.setState({
			name: gameInfos.name,
			series: gameInfos.series,
			date: moment/*.unix*/(gameInfos.releaseDate/* / 1000*/).format('DD/MM/YYYY'),
			developer: gameInfos.developer,
			publisher: gameInfos.publisher,
			genres: gameInfos.genres.join(', '),
			rating: gameInfos.rating,
			summary: gameInfos.summary,
			cover: gameInfos.cover,
			potentialBackgrounds: gameInfos.screenshots,
			backgroundScreen: (gameInfos.screenshots.length) ? (gameInfos.screenshots[0]) : ('')
		});
		this.props.closeIgdbModal();
	}

	private addPlayableGame(game: PlayableGame) {
		this.props.addPlayableGames([game]);
		this.closeModal();
	}

	private closeModal() {
		this.props.closeAddGameModal();
		this.setState({
			...this.emptyState,
			potentialBackgrounds: []
		});
	}

	private gameCoverClickHandler() {
		let cover: string = openImageDialog();
		if (cover)
			this.setState({
				cover
			});
	}

	private inputChangeHandler(event: any) {
		let name: string | any = event.target.name;
		let value: string = event.target.value;

		this.setState({
			[name]: value
		});
	}

	private dateChangeHandler(date: moment.Moment | string) {
		this.setState({
			date: (typeof date === 'string') ? (date) : (date.format('DD/MM/YYYY'))
		});
	}

	private ratingChangeHandler(value: number | any) {
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

	private changeBackgroundHandler(backgroundScreen: string) {
		this.setState({
			backgroundScreen
		});
	}

	private searchIgdbBtnClickHandler() {
		serverListener.send('search-igdb-games', this.state.name);
		this.props.openIgdbModal();
	}

	private addGameBtnClickHandler() {
		let gameInfos: any = { ...this.state };
		delete gameInfos.potentialBackgrounds;
		delete gameInfos.isEditing;
		delete gameInfos.igdbResearchModalOpen;

		if (gameInfos.cover && !gameInfos.cover.startsWith('http') && !gameInfos.cover.startsWith('file://'))
			gameInfos.cover = `file://${gameInfos.cover}`;
		if (gameInfos.backgroundScreen && !gameInfos.backgroundScreen.startsWith('http') && !gameInfos.backgroundScreen.startsWith('file://'))
			gameInfos.backgroundScreen = `file://${gameInfos.backgroundScreen}`;

		if (this.state.isEditing)
			serverListener.send('edit-game', this.props.potentialGameToAdd.uuid, gameInfos);
		else
			serverListener.send('add-game', gameInfos);
	}

	public componentDidMount() {
		serverListener.listen('send-igdb-game', this.fillIgdbGame.bind(this))
			.listen('add-playable-game', this.addPlayableGame.bind(this));
	}

	public componentWillReceiveProps(props: Props) {
		if (props.potentialGameToAdd) {
			let gameToAdd: PotentialGame = props.potentialGameToAdd;
			let [executable, args]: string[] = (gameToAdd.commandLine.length > 1) ? (gameToAdd.commandLine) : ([gameToAdd.commandLine[0], '']);

			this.setState({
				isEditing: props.isEditing,
				name: gameToAdd.name,
				cover: gameToAdd.details.cover,
				source: gameToAdd.source,
				executable,
				arguments: args,
				series: gameToAdd.details.series || '',
				date: (gameToAdd.details.releaseDate) ? (moment/*.unix*/(gameToAdd.details.releaseDate/* / 1000*/).format('DD/MM/YYYY')) : (''),
				developer: gameToAdd.details.developer || '',
				publisher: gameToAdd.details.publisher || '',
				genres: (gameToAdd.details.genres) ? (gameToAdd.details.genres.join(', ')) : (''),
				rating: gameToAdd.details.rating || '',
				summary: gameToAdd.details.summary || '',
				potentialBackgrounds: (gameToAdd.details.backgroundScreen) ? ([gameToAdd.details.backgroundScreen]) : ([]),
				backgroundScreen: gameToAdd.details.backgroundScreen || ''
			});
		}
	}

	public render(): JSX.Element {
		return (
			<Modal
				open={this.props.visible}
				onClose={this.closeModal.bind(this)}
				size={'large'}
				className={css(styles.modal)}
			>
				<Modal.Header>{(this.state.isEditing) ? (localizer.f('editGameLabel')) : (localizer.f('addGameLabel'))}</Modal.Header>
				<Modal.Content className={css(styles.modalBody)}>
					<Grid>
						<Grid.Column width={3}>
							<label className={css(styles.formLabel)}>{localizer.f('coverLabel')}</label>
							<div className={css(styles.coverWrapper)}>
								<BlurPicture
									faIcon={faFolderOpen}
									fontSize={55}
									background={this.state.cover}
									clickHandler={this.gameCoverClickHandler.bind(this)}
								/>
							</div>
						</Grid.Column>
						<Grid.Column width={1}/>
						<Grid.Column width={12}>
							<Form>
								<Form.Field>
									<label className={css(styles.formLabel)}>{localizer.f('gameName')}</label>
									<Input
										name={'name'}
										size={'large'}
										placeholder={localizer.f('gameName')}
										value={this.state.name}
										onChange={this.inputChangeHandler.bind(this)}
									/>
								</Form.Field>
								<Grid>
									<Grid.Column width={11}>
										<Form.Field>
											<label className={css(styles.formLabel)}>{localizer.f('gamesSeries')}</label>
											<Input
												name={'series'}
												size={'large'}
												placeholder={localizer.f('gamesSeries')}
												value={this.state.series}
												onChange={this.inputChangeHandler.bind(this)}
											/>
										</Form.Field>
									</Grid.Column>
									<Grid.Column width={5}>
										<Form.Field>
											<label className={css(styles.formLabel)}>{localizer.f('releaseDate')}</label>
											<DatePicker
												value={this.state.date}
												dateFormat={'DD/MM/YYYY'}
												onChange={this.dateChangeHandler.bind(this)}
												inputProps={{
													size: 'large',
													placeholder: localizer.f('releaseDate'),
													readOnly: true
												}}
											/>
										</Form.Field>
									</Grid.Column>
								</Grid>
								<Grid>
									<Grid.Column width={8}>
										<Form.Field>
											<label className={css(styles.formLabel)}>{localizer.f('developer')}</label>
											<Input
												name={'developer'}
												size={'large'}
												placeholder={localizer.f('developer')}
												value={this.state.developer}
												onChange={this.inputChangeHandler.bind(this)}
											/>
										</Form.Field>
									</Grid.Column>
									<Grid.Column width={8}>
										<Form.Field>
											<label className={css(styles.formLabel)}>{localizer.f('publisher')}</label>
											<Input
												name={'publisher'}
												size={'large'}
												placeholder={localizer.f('publisher')}
												value={this.state.publisher}
												onChange={this.inputChangeHandler.bind(this)}
											/>
										</Form.Field>
									</Grid.Column>
								</Grid>
								<Grid>
									<Grid.Column style={{ width: 84.5.percents() }}>
										<Form.Field>
											<label className={css(styles.formLabel)}>{localizer.f('genres')}</label>
											<Input
												name={'genres'}
												size={'large'}
												placeholder={localizer.f('genres')}
												value={this.state.genres}
												onChange={this.inputChangeHandler.bind(this)}
											/>
										</Form.Field>
									</Grid.Column>
									<Grid.Column width={2}>
										<Form.Field>
											<label className={css(styles.formLabel)}>{localizer.f('rating')}</label>
											<NumberPicker
												min={1}
												max={100}
												name={'rating'}
												placeholder={localizer.f('rating')}
												value={this.state.rating}
												onChange={this.ratingChangeHandler.bind(this)}
											/>
										</Form.Field>
									</Grid.Column>
								</Grid>
								<Grid>
									<Grid.Column width={16}>
										<Form.Field>
											<label className={css(styles.formLabel)}>{localizer.f('summary')}</label>
											<TextArea
												name={'summary'}
												className={css(styles.formTextArea)}
												placeholder={localizer.f('summary')}
												value={this.state.summary}
												onChange={this.inputChangeHandler.bind(this)}
											/>
										</Form.Field>
									</Grid.Column>
								</Grid>
								<hr className={css(styles.formHr)}/>
								<Grid>
									<Grid.Column width={16}>
										<Form.Field>
											<label className={css(styles.formLabel)}>{localizer.f('executable')}</label>
											<Input
												label={
													<Button
														secondary={true}
														onClick={this.executableBtnClickHandler.bind(this)}
													>
														<FontAwesomeIcon icon={faFolderOpen}/>
													</Button>
												}
												labelPosition={'right'}
												name={'executable'}
												size={'large'}
												placeholder={localizer.f('executable')}
												value={this.state.executable}
												onClick={this.executableBtnClickHandler.bind(this)}
												readOnly={true}
											/>
										</Form.Field>
									</Grid.Column>
								</Grid>
								<Grid>
									<Grid.Column width={16}>
										<Form.Field>
											<label className={css(styles.formLabel)}>{localizer.f('lineArguments')}</label>
											<div className="ui large input">
												<input
													name={'arguments'}
													className={css(styles.lineArgumentsInput)}
													placeholder={localizer.f('lineArguments')}
													value={this.state.arguments}
													onChange={this.inputChangeHandler.bind(this)}
												/>
											</div>
										</Form.Field>
									</Grid.Column>
								</Grid>
								<hr className={css(styles.formHr)}/>
								<Grid>
									<Grid.Column width={16}>
										<Form.Field>
											<label className={css(styles.formLabel)}>{localizer.f('backgroundImage')}</label>
											<ImagesCollection
												images={this.state.potentialBackgrounds}
												onChange={this.changeBackgroundHandler.bind(this)}
											/>
										</Form.Field>
									</Grid.Column>
								</Grid>
								<input
									name={'cover'}
									value={this.state.cover}
									onChange={this.inputChangeHandler.bind(this)}
									hidden
								/>
								<input
									name={'background'}
									value={this.state.backgroundScreen}
									onChange={this.inputChangeHandler.bind(this)}
									hidden
								/>
								<input
									name={'source'}
									value={this.state.source}
									onChange={this.inputChangeHandler.bind(this)}
									hidden={true}
								/>
							</Form>
						</Grid.Column>
					</Grid>
				</Modal.Content>
				<Modal.Actions>
					<Button
						secondary={true}
						disabled={!this.state.name}
						onClick={this.searchIgdbBtnClickHandler.bind(this)}
					>
						{localizer.f('fillWithIgdb')}
					</Button>
					<Button
						primary={true}
						disabled={!this.state.name || !this.state.executable}
						onClick={this.addGameBtnClickHandler.bind(this)}
					>
						{(this.state.isEditing) ? (localizer.f('editGame')) : (localizer.f('submitNewGame'))}
					</Button>
				</Modal.Actions>
				<IgdbResearchModal/>
				{this.checkErrors()}
			</Modal>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	modal: {
		margin: margin(1..rem(), 'auto'),
		cursor: 'default',
		userSelect: 'none'
	},
	modalBody: {
		maxHeight: 82..vh(),
		overflowY: 'auto'
	},
	coverWrapper: {
		height: 270,
		paddingTop: 3
	},
	formHr: {
		border: 'none',
		borderTop: border(1, 'solid', rgba(238, 238, 238, 0.15)),
		margin: margin(30, 0, 16)
	},
	formTextArea: {
		resize: 'none',
		height: 7..em()
	},
	formLabel: {
		fontWeight: 'normal',
		fontSize: 1..em()
	},
	lineArgumentsInput: {
		fontFamily: 'Inconsolata'
	}
});
