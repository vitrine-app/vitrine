import * as React from 'react';
import { Button, Form, Grid, Input, Modal } from 'semantic-ui-react';
import { shell } from 'electron';
import { StyleSheet, css } from 'aphrodite';
import { margin, padding, rgba } from 'css-verbose';
import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';

import { serverListener } from '../ServerListener';
import { VitrineComponent } from './VitrineComponent';
import { NumberPicker } from './NumberPicker';
import { localizer } from '../Localizer';

import { faSearch, faCircleNotch } from '@fortawesome/fontawesome-free-solid';

interface Props {
	visible: boolean,
	openIgdbResearchModal: () => void,
	closeIgdbResearchModal: () => void
}

interface State {
	loading: boolean,
	research: string,
	resultsNb: number,
	researches: any[],
	selectedResearchId: number | string
}

export class IgdbResearchModal extends VitrineComponent<Props, State> {
	public constructor(props: Props) {
		super(props);

		this.state = {
			loading: true,
			research: '',
			resultsNb: 5,
			researches: [],
			selectedResearchId: ''
		};
	}

	private clickResearchHandler(id: number) {
		this.setState({
			selectedResearchId: id
		});
	}

	private gameDoubleClickHandler(id: number) {
		this.setState({
			selectedResearchId: id
		}, () => {
			this.igdbFillBtnClickHandler();
		})
	}

	private changeResearchHandler(event: any) {
		this.setState({
			research: event.target.value
		});
	}

	private changeResultsNbHandler(value: number) {
		this.setState({
			resultsNb: value
		});
	}

	private igdbSearchBtnClickHandler() {
		this.setState({
			loading: true
		}, () => {
			serverListener.send('search-igdb-games', this.state.research, this.state.resultsNb);
		});
	}

	private igdbFillBtnClickHandler() {
		this.setState({
			loading: true
		}, () => {
			serverListener.send('fill-igdb-game', this.state.selectedResearchId);
		});
	}

	private closeModal() {
		if (!this.state.loading) {
			this.props.closeIgdbResearchModal();
			this.setState({
				loading: true
			});
		}
	}

	private igdbLinkClickHandler() {
		let igdbUrl: string = 'https://www.igdb.com';
		shell.openExternal(igdbUrl);
	}

	public componentDidMount() {
		serverListener.listen('send-igdb-searches', (research: string, researches: any[]) => {
			this.setState({
				loading: false,
				research: research,
				selectedResearchId: '',
				researches
			});
		});
	}

	public render(): JSX.Element {
		const modalContent: JSX.Element = (!this.state.loading) ? (
			<Modal.Content className={css(styles.modalBody)}>
				<Form>
					<Grid>
						<Grid.Column width={10}>
							<Form.Field>
								<label className={css(styles.formLabel)}>{localizer.f('gameName')}</label>
								<Input
									name={'name'}
									size={'large'}
									placeholder={localizer.f('gameName')}
									value={this.state.research}
									onChange={this.changeResearchHandler.bind(this)}
								/>
							</Form.Field>
						</Grid.Column>
						<Grid.Column width={3}>
							<Form.Field>
								<label>{localizer.f('resultsNumber')}</label>
								<NumberPicker
									min={1}
									max={20}
									name={'rating'}
									value={this.state.resultsNb}
									placeholder={localizer.f('resultsNumber')}
									onChange={this.changeResultsNbHandler.bind(this)}
								/>
							</Form.Field>
						</Grid.Column>
						<Grid.Column width={2}>
							<Button
								primary={true}
								onClick={this.igdbSearchBtnClickHandler.bind(this)}
								className={css(styles.searchBtn)}
							>
								<FontAwesomeIcon icon={faSearch}/>
							</Button>
						</Grid.Column>
					</Grid>
				</Form>
				<div className={css(styles.igdbResearchList)}>
					{this.state.researches.map((research: any, index: number) =>
						<div
							key={index}
							className={css(styles.igdbResearch) + ' ' + ((this.state.selectedResearchId === research.id) ? (css(styles.selectedIgdbResearch)) : (''))}
							onClick={this.clickResearchHandler.bind(this, research.id)}
							onDoubleClick={this.gameDoubleClickHandler.bind(this, research.id)}
						>
							<Grid>
								<Grid.Column
									style={{ width: 20..percents() }}
									className={css(styles.igdbResearchImgColumn)}
								>
									<img src={research.cover} className={css(styles.igdbResearchImg)}/>
								</Grid.Column>
								<Grid.Column width={12}>
									{research.name}
								</Grid.Column>
							</Grid>
						</div>
					)}
				</div>
				<span className={css(styles.igdbDisclaimer)}>
					{localizer.f('igdbDisclaimer')}
					<a
						className={css(styles.igdbLink)}
						onClick={this.igdbLinkClickHandler.bind(this)}
					>
						IGDB
					</a>.
				</span>
			</Modal.Content>
		) : (
			<Modal.Content>
				<div className={css(styles.loadingContainer)}>
					<FontAwesomeIcon
						icon={faCircleNotch}
						spin={true}
						className={css(styles.loadingIcon)}
					/>
				</div>
			</Modal.Content>
		);

		return (
			<Modal
				open={this.props.visible}
				onClose={this.closeModal.bind(this)}
				size={'tiny'}
				className={css(styles.modal)}
			>
				<Modal.Header>{localizer.f('fillWithIgdb')}</Modal.Header>
				{modalContent}
				<Modal.Actions style={{ opacity: (!this.state.loading) ? (1) : (0) }}>
					<Button
						primary={true}
						disabled={!this.state.selectedResearchId}
						onClick={this.igdbFillBtnClickHandler.bind(this)}
					>
						{localizer.f('submitNewGame')}
					</Button>
				</Modal.Actions>
			</Modal>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	modal: {
		margin: margin(9..rem(), 'auto'),
		cursor: 'default',
		userSelect: 'none'
	},
	modalBody: {
		height: 500,
		overflowX: 'hidden',
		overflowY: 'auto'
	},
	igdbResearchList: {
		paddingTop: 10..px()
	},
	igdbResearch: {
		margin: margin(7, 0),
		padding: padding(10, 0),
		borderRadius: 4,
		backgroundColor: '#39342E',
		transition: `${50}ms ease`,
		':hover': {
			backgroundColor: rgba(247, 210, 174, 0.1)
		}
	},
	selectedIgdbResearch: {
		boxShadow: `inset ${0} ${0} ${0} ${2..px()} #81705E`,
		fontWeight: 600
	},
	igdbResearchImgColumn: {
		paddingLeft: 5..percents()
	},
	igdbResearchImg: {
		width: 90,
		height: 120,
		borderRadius: 4
	},
	igdbDisclaimer: {
		fontSize: 11,
		paddingLeft: 10,
		opacity: 0.5
	},
	igdbLink: {
		cursor: 'pointer'
	},
	loadingContainer: {
		height: 100..percents(),
		paddingTop: 13..percents(),
		paddingBottom: 13..percents(),
		paddingLeft: 41..percents()
	},
	loadingIcon: {
		fontSize: 120,
		opacity: 0.2
	},
	formLabel: {
		fontWeight: 'normal',
		fontSize: 1..em()
	},
	searchBtn: {
		marginTop: 22,
		marginLeft: 25,
		padding: padding(13, 14),
		fontSize: 1.3.em()
	}
});
