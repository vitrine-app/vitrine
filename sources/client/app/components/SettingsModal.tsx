import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { css, StyleSheet } from 'aphrodite';
import { border, margin, padding, rgba } from 'css-verbose';
import * as React from 'react';
import { Button, Form, Grid, Input, Modal, Tab, Table, Transition } from 'semantic-ui-react';

import { EmulatorSettingsRow } from '../containers/EmulatorSettingsRow';
import { openDirectory } from '../helpers';
import { localizer } from '../Localizer';
import { serverListener } from '../ServerListener';
import { GamesModule } from './GamesModule';
import { VitrineComponent } from './VitrineComponent';

import { faFolderOpen } from '@fortawesome/fontawesome-free-solid';
import * as battleNetIcon from '../../resources/images/battle_net_icon.png';
import * as emulatedIcon from '../../resources/images/emulated_icon.png';
import * as originIcon from '../../resources/images/origin_icon.png';
import * as steamIcon from '../../resources/images/steam_icon.png';

interface Props {
	settings: any;
	emulators: any[];
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
	aliveEmulators: any[];
	emulatorsError: string;
	transitionVisible: boolean;
}

export class SettingsModal extends VitrineComponent<Props, State> {
	private readonly emptyState: State;

	public constructor(props: Props) {
		super(props);

		this.emptyState = {
			langs: localizer.getLanguages(),
			lang: localizer.getSelectedLanguage(),
			steamEnabled: (this.props.settings && this.props.settings.steam) ? (true) : (false),
			originEnabled: (this.props.settings && this.props.settings.origin) ? (true) : (false),
			battleNetEnabled: (this.props.settings && this.props.settings.battleNet) ? (true) : (false),
			emulatedEnabled: (this.props.settings && this.props.settings.emulated) ? (true) : (false),
			steamPath: (this.props.settings && this.props.settings.steam) ? (this.props.settings.steam.installFolder) : (''),
			originPath: (this.props.settings && this.props.settings.origin) ? (this.props.settings.origin.installFolder) : (''),
			emulatedPath: (this.props.settings.emulated) ? (this.props.settings.emulated.romsFolder) : (''),
			steamError: false,
			originError: false,
			emulatedError: false,
			aliveEmulators: (this.props.settings.emulated) ? (this.props.settings.emulated.aliveEmulators) : ([]),
			emulatorsError: '',
			transitionVisible: true
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
		this.animateModal = this.animateModal.bind(this);
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

	private emulatorConfigChange(emulatorConfig: any) {
		let aliveEmulators: any[] = this.state.aliveEmulators;
		if (emulatorConfig.path !== undefined) {
			const found: boolean = this.state.aliveEmulators.filter((aliveEmulator: any) => aliveEmulator.id === emulatorConfig.id).length > 0;
			if (!found)
				aliveEmulators.push(emulatorConfig);
			else
				aliveEmulators = aliveEmulators.map((aliveEmulator: any) =>
					(aliveEmulator.id !== emulatorConfig.id) ? (aliveEmulator) : (emulatorConfig)
				);
		}
		else
			aliveEmulators = aliveEmulators.filter((aliveEmulator: any) => aliveEmulator.id !== emulatorConfig.id);
		this.setState({
			aliveEmulators
		});
	}

	private submitButton() {
		let sendable: boolean = true;
		const settingsForm: any = {
			lang: this.state.lang
		};
		if (this.state.steamEnabled) {
			if (this.state.steamPath) {
				settingsForm.steam = {
					installFolder: this.state.steamPath
				};
				this.setState({
					steamError: false
				});
			}
			else {
				sendable = false;
				this.setState({
					steamError: true
				});
			}
		}
		if (this.state.originEnabled) {
			if (this.state.originPath) {
				settingsForm.origin = {
					installFolder: this.state.originPath
				};
				this.setState({
					originError: false
				});
			}
			else {
				sendable = false;
				this.setState({
					originError: true
				});
			}
		}
		if (this.state.battleNetEnabled)
			settingsForm.battleNet = {};
		if (this.state.emulatedEnabled) {
			if (this.state.emulatedPath) {
				settingsForm.emulated = {
					romsFolder: this.state.emulatedPath,
					aliveEmulators: this.state.aliveEmulators
				};
				this.setState({
					emulatedError: false
				});
			}
			else {
				sendable = false;
				this.setState({
					emulatedError: true
				});
			}
		}
		const emulatorsError: string = this.state.aliveEmulators.map((aliveEmulator: any) => {
			if (!aliveEmulator.path || (aliveEmulator.command !== undefined && !aliveEmulator.command)) {
				sendable = false;
				const emulatorName: string = this.props.emulators.filter((emulator: any) => emulator.id === aliveEmulator.id)[0].name;
				return `${emulatorName} ${localizer.f('emulatorConfigError')}`;
			}
			return;
		}).filter((error: string) => error).join(' ');
		this.setState({
			emulatorsError
		});
		if (sendable) {
			serverListener.send('update-settings', settingsForm);
		}
	}

	private animateModal(startingAnimation: boolean) {
		if (startingAnimation === this.props.visible)
			this.setState({
				transitionVisible: this.props.visible
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
						{this.props.emulators.map((emulator: any, index: number) =>
							<EmulatorSettingsRow
								key={index}
								emulatorData={emulator}
								emulator={(this.props.settings.emulated) ? (this.props.settings.emulated.aliveEmulators.filter(
									(aliveEmulator: any) => aliveEmulator.id === emulator.id
								)[0]) : (null)}
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
			<Transition
				animation={'fade down'}
				duration={this.modalsTransitionDuration}
				onStart={this.animateModal.bind(this, true)}
				onComplete={this.animateModal.bind(this, false)}
				visible={this.props.visible}
			>
				<Modal
					size={'large'}
					open={this.state.transitionVisible}
					onClose={this.closeModal}
					className={css(styles.modal)}
				>
					<Modal.Header
						className={css(styles.modalHeader)}
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
							menu={{
								fluid: true,
								vertical: true,
								tabular: 'right'
							}}
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
					<Modal.Actions className={css(styles.modalHeader)}>
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
			</Transition>
		);
	}
}

const styles: React.CSSProperties & any = StyleSheet.create({
	modal: {
		margin: margin(5..rem(), 'auto'),
		width: 70..vw(),
		cursor: 'default',
		userSelect: 'none'
	},
	modalHeader: {
		border: 'none'
	},
	settingsPane: {
		height: 64..vh(),
		overflowY: 'auto',
		border: 'none'
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
