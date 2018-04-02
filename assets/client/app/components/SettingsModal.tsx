import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { css, StyleSheet } from 'aphrodite';
import { border, margin, padding, rgba } from 'css-verbose';
import * as React from 'react';
import { Button, Form, Grid, Input, Modal, Tab, Table } from 'semantic-ui-react';

import { openDirectory } from '../helpers';
import { localizer } from '../Localizer';
import { serverListener } from '../ServerListener';
import { EmulatorSettingsRow } from './EmulatorSettingsRow';
import { GamesModule } from './GamesModule';
import { VitrineComponent } from './VitrineComponent';

import { faFolderOpen } from '@fortawesome/fontawesome-free-solid';
import * as battleNetIcon from '../../resources/images/battleNetIcon.png';
import * as emulatedIcon from '../../resources/images/emulatedIcon.png';
import * as originIcon from '../../resources/images/originIcon.png';
import * as steamIcon from '../../resources/images/steamIcon.png';

interface Props {
	settings: any;
	visible: boolean;
	firstLaunch: boolean;
	updateSettings: (settings: any) => void;
	closeSettingsModal: () => void;
}

interface State {
	langs: any[];
	lang: string;
	steamEnabled: boolean;
	originEnabled: boolean;
	battleNetEnabled: boolean;
	emulatedEnabled: boolean;
	steamPath: string;
	originPath: string;
	emulatedPath: string;
	steamError: boolean;
	originError: boolean;
	emulatedError: boolean;
	emulatorsCurrentConfig: any;
	emulatorsError: string;
}

export class SettingsModal extends VitrineComponent<Props, State> {
	private emptyState: State;

	public constructor(props: Props) {
		super(props);

		this.emptyState = {
			langs: localizer.getLanguages(),
			lang: localizer.getSelectedLanguage(),
			steamEnabled: (this.props.settings && this.props.settings.steam) ? (true) : (false),
			originEnabled: (this.props.settings && this.props.settings.origin) ? (true) : (false),
			battleNetEnabled: (this.props.settings && this.props.settings.battleNet) ? (true) : (false),
			emulatedEnabled: (this.props.settings && this.props.settings.emulated.romsFolder) ? (true) : (false),
			steamPath: (this.props.settings && this.props.settings.steam) ? (this.props.settings.steam.installFolder) : (''),
			originPath: (this.props.settings && this.props.settings.origin) ? (this.props.settings.origin.installFolder) : (''),
			emulatedPath: (this.props.settings.emulated.romsFolder) ? (this.props.settings.emulated.romsFolder) : (''),
			steamError: false,
			originError: false,
			emulatedError: false,
			emulatorsCurrentConfig: this.props.settings.emulated.emulators,
			emulatorsError: ''
		};
		this.state = this.emptyState;

		this.closeModal = this.closeModal.bind(this);
		this.steamIconClick = this.steamIconClick.bind(this);
		this.originIconClick = this.originIconClick.bind(this);
		this.battleNetIconClick = this.battleNetIconClick.bind(this);
		this.emulatedIconClick = this.emulatedIconClick.bind(this);
		this.steamPathButton = this.steamPathButton.bind(this);
		this.originPathButton = this.originPathButton.bind(this);
		this.emulatedPathButton = this.emulatedPathButton.bind(this);
		this.langSelect = this.langSelect.bind(this);
		this.emulatorConfigChange = this.emulatorConfigChange.bind(this);
		this.submitButton = this.submitButton.bind(this);
	}

	private closeModal() {
		if (this.props.firstLaunch)
			return;
		this.props.closeSettingsModal();
		this.setState(this.emptyState);
	}

	private steamIconClick(checked: boolean) {
		if ((checked && !this.state.steamEnabled) || (!checked && this.state.steamEnabled)) {
			this.setState({
				steamEnabled: !this.state.steamEnabled,
				steamError: false
			});
		}
	}

	private originIconClick(checked: boolean) {
		if ((checked && !this.state.originEnabled) || (!checked && this.state.originEnabled)) {
			this.setState({
				originEnabled: !this.state.originEnabled,
				originError: false
			});
		}
	}

	private battleNetIconClick(checked: boolean) {
		if ((checked && !this.state.battleNetEnabled) || (!checked && this.state.battleNetEnabled)) {
			this.setState({
				battleNetEnabled: !this.state.battleNetEnabled
			});
		}
	}

	private emulatedIconClick(checked: boolean) {
		if ((checked && !this.state.emulatedEnabled) || (!checked && this.state.emulatedEnabled)) {
			this.setState({
				emulatedEnabled: !this.state.emulatedEnabled,
				emulatedError: false
			});
		}
	}

	private steamPathButton() {
		const steamPath: string = openDirectory();
		if (steamPath) {
			this.setState({
				steamPath
			});
		}
	}

	private originPathButton() {
		const originPath: string = openDirectory();
		if (originPath) {
			this.setState({
				originPath
			});
		}
	}

	private emulatedPathButton() {
		const emulatedPath: string = openDirectory();
		if (emulatedPath) {
			this.setState({
				emulatedPath
			});
		}
	}

	private langSelect(event: any, data: any) {
		this.setState({
			lang: data.value
		});
	}

	private emulatorConfigChange(emulatorId: number, emulatorConfig: any) {
		const emulatorsCurrentConfig: any[] = this.state.emulatorsCurrentConfig;
		emulatorsCurrentConfig[emulatorId] = emulatorConfig;
		this.setState({
			emulatorsCurrentConfig
		});
	}

	private submitButton() {
		let canBeSent: boolean = true;

		const form: any = {
			lang: this.state.lang
		};
		if (this.state.steamEnabled) {
			if (this.state.steamPath) {
				form.steamPath = this.state.steamPath;
				this.setState({
					steamError: false
				});
			}
			else {
				canBeSent = false;
				this.setState({
					steamError: true
				});
			}
		}
		if (this.state.originEnabled) {
			if (this.state.originPath) {
				form.originPath = this.state.originPath;
				this.setState({
					originError: false
				});
			}
			else {
				canBeSent = false;
				this.setState({
					originError: true
				});
			}
		}
		if (this.state.battleNetEnabled) {
			form.battleNetEnabled = true;
		}
		if (this.state.emulatedEnabled) {
			if (this.state.emulatedPath) {
				form.emulatedPath = this.state.emulatedPath;
				this.setState({
					emulatedError: false
				});
			}
			else {
				canBeSent = false;
				this.setState({
					emulatedError: true
				});
			}
		}

		let emulatorsError: string = '';
		this.state.emulatorsCurrentConfig.forEachEnd((emulatorConfig: any, done: () => void) => {
			if (emulatorConfig.active && (!emulatorConfig.path || !emulatorConfig.command)) {
				canBeSent = false;
				emulatorsError += `${emulatorConfig.name} ${localizer.f('emulatorConfigError')} `;
			}
			done();
		}, () => {
			this.setState({
				emulatorsError
			});
			if (canBeSent)
				serverListener.send('update-settings', { ...form, emulators: this.state.emulatorsCurrentConfig });
		});
	}

	public render(): JSX.Element {
		const modulesSettings: JSX.Element = (
			<Tab.Pane className={css(styles.settingsPane)}>
				<Grid>
					<Grid.Column width={4}>
						<GamesModule
							clicked={this.state.steamEnabled}
							iconFile={steamIcon}
							iconAlt={'Steam'}
							clickHandler={this.steamIconClick}
						/>
					</Grid.Column>
					<Grid.Column width={4}>
						<GamesModule
							clicked={this.state.originEnabled}
							iconFile={originIcon}
							iconAlt={'Origin'}
							clickHandler={this.originIconClick}
						/>
					</Grid.Column>
					<Grid.Column width={4}>
						<GamesModule
							clicked={this.state.battleNetEnabled}
							iconFile={battleNetIcon}
							iconAlt={'Battle.net'}
							clickHandler={this.battleNetIconClick}
						/>
					</Grid.Column>
					<Grid.Column width={4}>
						<GamesModule
							clicked={this.state.emulatedEnabled}
							iconFile={emulatedIcon}
							iconAlt={'Origin'}
							clickHandler={this.emulatedIconClick}
						/>
					</Grid.Column>
				</Grid>
				<Form>
					<div style={{ display: (this.state.steamEnabled) ? ('block') : ('none') }}>
						<hr className={css(styles.formHr)}/>
						<h3>{localizer.f('steamConfig')}</h3>
						<Form.Field error={this.state.steamError}>
							<label>{localizer.f('steamPath')}</label>
							<Input
								label={
									<Button
										secondary={true}
										onClick={this.steamPathButton}
									>
										<FontAwesomeIcon icon={faFolderOpen}/>
									</Button>
								}
								labelPosition={'right'}
								name={'steam'}
								size={'large'}
								placeholder={localizer.f('steamPath')}
								value={this.state.steamPath}
								onClick={this.steamPathButton}
								readOnly={true}
							/>
							<span
								className={css(styles.modulesError)}
								style={{ display: (this.state.steamError) ? ('inline') : ('none') }}
							>
								{localizer.f('pathError')}
							</span>
						</Form.Field>
					</div>
					<div style={{ display: (this.state.originEnabled) ? ('block') : ('none') }}>
						<hr className={css(styles.formHr)}/>
						<h3>{localizer.f('originConfig')}</h3>
						<Form.Field error={this.state.originError}>
							<label>{localizer.f('originGamesPath')}</label>
							<Input
								label={
									<Button
										secondary={true}
										onClick={this.originPathButton}
									>
										<FontAwesomeIcon icon={faFolderOpen}/>
									</Button>
								}
								labelPosition={'right'}
								name={'origin'}
								size={'large'}
								placeholder={localizer.f('originGamesPath')}
								value={this.state.originPath}
								onClick={this.originPathButton}
								readOnly={true}
							/>
							<span
								className={css(styles.modulesError)}
								style={{ display: (this.state.originError) ? ('inline-block') : ('none') }}
							>
								{localizer.f('pathError')}
							</span>
						</Form.Field>
					</div>
					<div style={{ display: (this.state.emulatedEnabled) ? ('block') : ('none') }}>
						<hr className={css(styles.formHr)}/>
						<h3>{localizer.f('emulatedConfig')}</h3>
						<Form.Field error={this.state.emulatedError}>
							<label>{localizer.f('emulatedGamesPath')}</label>
							<Input
								label={
									<Button
										secondary={true}
										onClick={this.emulatedPathButton}
									>
										<FontAwesomeIcon icon={faFolderOpen}/>
									</Button>
								}
								labelPosition={'right'}
								name={'emulated'}
								size={'large'}
								placeholder={localizer.f('emulatedGamesPath')}
								value={this.state.emulatedPath}
								onClick={this.emulatedPathButton}
								readOnly={true}
							/>
							<span
								className={css(styles.modulesError)}
								style={{ display: (this.state.emulatedError) ? ('inline-block') : ('none') }}
							>
								{localizer.f('pathError')}
							</span>
						</Form.Field>
					</div>
				</Form>
			</Tab.Pane>
		);

		const emulatorsSettings: JSX.Element = (
			<Tab.Pane className={css(styles.settingsPane)}>
				<p className={css(styles.emulatorsError)}>{this.state.emulatorsError}</p>
				<Table celled={true}>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell width={3}>
								{localizer.f('emulatorName')}
							</Table.HeaderCell>
							<Table.HeaderCell width={3}>
								{localizer.f('emulatorPlatforms')}
							</Table.HeaderCell>
							<Table.HeaderCell width={2}>
								{localizer.f('emulatorActive')}
							</Table.HeaderCell>
							<Table.HeaderCell width={4}>
								{localizer.f('emulatorPath')}
							</Table.HeaderCell>
							<Table.HeaderCell width={4}>
								{localizer.f('emulatorCommand')}
							</Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{Object.keys(this.props.settings.emulated.emulators).map((emulatorId: string, index: number) =>
							<EmulatorSettingsRow
								key={index}
								id={emulatorId}
								emulator={this.props.settings.emulated.emulators[emulatorId]}
								platforms={this.props.settings.emulated.emulators[emulatorId].platforms.map(
									(platformsId) => this.props.settings.emulated.platforms[platformsId]
								)}
								onChange={this.emulatorConfigChange}
							/>
						)}
					</Table.Body>
				</Table>
				<p className={css(styles.emulatorsCommandLineInstruction)}>{localizer.f('emulatorCommandLineInstruction')}</p>
			</Tab.Pane>
		);

		const langsSettings: JSX.Element = (
			<Tab.Pane className={css(styles.settingsPane)}>
				<Form.Select
					name={'lang'}
					fluid={true}
					value={this.state.lang}
					onChange={this.langSelect}
					className={css(styles.langSelect)}
					options={Object.keys(this.state.langs).map((langName: string, index: number) => ({
						key: index,
						value: langName,
						text: this.state.langs[langName].language
					}))}
				/>
			</Tab.Pane>
		);

		return (
			<Modal
				open={this.props.visible}
				onClose={this.closeModal}
				className={css(styles.modal)}
			>
				<Modal.Header
					style={{ display: (!this.props.firstLaunch) ? ('block') : ('none') }}
				>
					{localizer.f('settings')}
				</Modal.Header>
				<Modal.Content>
					<div style={{ display: (this.props.firstLaunch) ? ('block') : ('none') }}>
						<h1>{localizer.f('welcomeMessage')}</h1>
						<p>{localizer.f('wizardText')}</p>
					</div>
					<Tab
						panes={[
							{
								menuItem: localizer.f('modules'),
								render: () => modulesSettings
							},
							{
								menuItem: localizer.f('emulators'),
								render: () => emulatorsSettings
							},
							{
								menuItem: localizer.f('lang'),
								render: () => langsSettings
							}
						]}
					/>
				</Modal.Content>
				<Modal.Actions>
					<Button
						secondary={true}
						style={{ display: (!this.props.firstLaunch) ? ('inline-block') : ('none') }}
						onClick={this.closeModal}
					>
						{localizer.f('cancel')}
					</Button>
					<Button
						primary={true}
						onClick={this.submitButton}
					>
						{localizer.f('confirm')}
					</Button>
				</Modal.Actions>
				{this.checkErrors()}
			</Modal>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	modal: {
		margin: margin(5..rem(), 'auto'),
		cursor: 'default',
		userSelect: 'none'
	},
	settingsPane: {
		maxHeight: 64..vh(),
		overflowY: 'auto'
	},
	formHr: {
		border: 'none',
		borderTop: border(1, 'solid', rgba(238, 238, 238, 0.15)),
		margin: margin(20, -14)
	},
	langSelect: {
		padding: padding(20, 0, 100),
		width: 100..percents()
	},
	modulesError: {
		color: '#A94442',
		fontWeight: 600,
		marginTop: 5
	},
	emulatorsError: {
		color: '#A94442',
		marginTop: 15
	},
	emulatorsCommandLineInstruction: {
		fontSize: 14,
		marginBottom: 10,
		paddingLeft: 10,
		opacity: 0.5,
		float: 'right'
	},
});
