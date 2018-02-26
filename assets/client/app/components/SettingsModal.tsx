import * as React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { padding } from 'css-verbose';
import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';

import { serverListener } from '../ServerListener';
import { VitrineComponent } from './VitrineComponent';
import { GamesModule } from './GamesModule';
import { EmulatorSettingsRow } from './EmulatorSettingsRow';
import { localizer } from '../Localizer';
import { openDirectory } from '../helpers';

import { faFolderOpen } from '@fortawesome/fontawesome-free-solid';
import * as steamIcon from '../../resources/images/steamIcon.png';
import * as originIcon from '../../resources/images/originIcon.png';
import * as emulatedIcon from '../../resources/images/emulatedIcon.png';

interface Props {
	firstLaunch: boolean,
	settings: any,
	updateSettings: (settings: any) => void
}

interface State {
	langs: any[],
	lang: string,
	steamEnabled: boolean,
	originEnabled: boolean,
	emulatedEnabled: boolean,
	steamPath: string,
	originPath: string,
	emulatedPath: string,
	steamError: boolean,
	originError: boolean,
	emulatedError: boolean,
	emulatorsCurrentConfig: any,
	emulatorsError: string
}

export class SettingsModal extends VitrineComponent<Props, State> {
	public constructor(props: Props) {
		super(props);

		this.state = {
			langs: localizer.getLanguages(),
			lang: localizer.getSelectedLanguage(),
			steamEnabled: (this.props.settings && this.props.settings.steam) ? (true) : (false),
			originEnabled: (this.props.settings && this.props.settings.origin) ? (true) : (false),
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
	}

	private steamIconClickHandler(checked: boolean) {
		if ((checked && !this.state.steamEnabled) || (!checked && this.state.steamEnabled)) {
			this.setState({
				steamEnabled: !this.state.steamEnabled,
				steamError: false
			});
		}
	}

	private originIconClickHandler(checked: boolean) {
		if ((checked && !this.state.originEnabled) || (!checked && this.state.originEnabled)) {
			this.setState({
				originEnabled: !this.state.originEnabled,
				originError: false
			});
		}
	}

	private emulatedIconClickHandler(checked: boolean) {
		if ((checked && !this.state.emulatedEnabled) || (!checked && this.state.emulatedEnabled)) {
			this.setState({
				emulatedEnabled: !this.state.emulatedEnabled,
				emulatedError: false
			});
		}
	}



	private steamPathBtnClickHandler() {
		let steamPath: string = openDirectory();
		if (steamPath) {
			this.setState({
				steamPath
			});
		}
	}

	private originPathBtnClickHandler() {
		let originPath: string = openDirectory();
		if (originPath) {
			this.setState({
				originPath
			});
		}
	}

	private emulatedPathBtnClickHandler() {
		let emulatedPath: string = openDirectory();
		if (emulatedPath) {
			this.setState({
				emulatedPath
			});
		}
	}

	private langSelectChangeHandler(event: any) {
		let value: string = event.target.value;
		this.setState({
			lang: value
		});
	}

	private emulatorConfigChangeHandler(emulatorId: number, emulatorConfig: any) {
		let emulatorsCurrentConfig: any[] = this.state.emulatorsCurrentConfig;
		emulatorsCurrentConfig[emulatorId] = emulatorConfig;
		this.setState({
			emulatorsCurrentConfig
		});
	}

	private submitBtnClickHandler() {
		let canBeSent: boolean = true;

		let form: any = {
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
		let counter: number = 0;
		this.state.emulatorsCurrentConfig.forEach((emulatorConfig: any) => {
			if (emulatorConfig.active && (!emulatorConfig.path || !emulatorConfig.command)) {
				canBeSent = false;
				emulatorsError += `${emulatorConfig.name} ${localizer.f('emulatorConfigError')} `;
			}
			counter++;
			if (counter === this.state.emulatorsCurrentConfig.length) {
				this.setState({
					emulatorsError
				});
				if (canBeSent)
					serverListener.send('update-settings', { ...form, emulators: this.state.emulatorsCurrentConfig });
			}
		});
	}

	public componentDidMount() {
		$('#options-pane-lang').find('select').selectpicker();
	}

	public render(): JSX.Element {
		return (
			<div
				id="settings-modal"
				className={`modal fade ${css(styles.modal)}`}
				role="dialog"
				data-keyboard={(this.props.firstLaunch) ? (false) : (true)}
				data-backdrop={(this.props.firstLaunch) ? ('static') : (true)}
			>
				<div className={`modal-dialog ${css(styles.modalDialog)}`}>
					<div className="modal-content">
						<div
							className="modal-header"
							style={{ display: (!this.props.firstLaunch) ? ('block') : ('none') }}
						>
							{localizer.f('settings')}
						</div>
						<div className={`modal-body ${css(styles.modalBody)}`}>
							<form>
								<div style={{ display: (this.props.firstLaunch) ? ('block') : ('none') }}>
									<h1>{localizer.f('welcomeMessage')}</h1>
									<p>{localizer.f('wizardText')}</p>
								</div>
								<ul className="nav nav-tabs">
									<li className="active">
										<a className={css(styles.navTabsLink)} data-toggle="tab" href="#options-pane-modules">
											{localizer.f('modules')}
										</a>
									</li>
									<li>
										<a className={css(styles.navTabsLink)} data-toggle="tab" href="#options-pane-emulators">
											{localizer.f('emulators')}
										</a>
									</li>
									<li>
										<a className={css(styles.navTabsLink)} data-toggle="tab" href="#options-pane-lang">
											{localizer.f('lang')}
										</a>
									</li>
								</ul>
								<div className="tab-content">
									<div id="options-pane-modules" className="tab-pane fade in active">
										<div className="row">
											<div className="col-md-offset-1 col-md-3">
												<GamesModule
													clicked={this.state.steamEnabled}
													iconFile={steamIcon}
													iconAlt={'Steam'}
													clickHandler={this.steamIconClickHandler.bind(this)}
												/>
											</div>
											<div className="col-md-3">
												<GamesModule
													clicked={this.state.originEnabled}
													iconFile={originIcon}
													iconAlt={'Origin'}
													clickHandler={this.originIconClickHandler.bind(this)}
												/>
											</div>
											<div className="col-md-3">
												<GamesModule
													clicked={this.state.emulatedEnabled}
													iconFile={emulatedIcon}
													iconAlt={'Origin'}
													clickHandler={this.emulatedIconClickHandler.bind(this)}
												/>
											</div>
										</div>
										<div style={{ display: (this.state.steamEnabled) ? ('block') : ('none') }}>
											<hr/>
											<h3>{localizer.f('steamConfig')}</h3>
											<div className={`form-group ${((this.state.steamError) ? (' has-error') : (''))}`}>
												<label>{localizer.f('steamPath')}</label>
												<div className="input-group">
													<input
														className="form-control"
														name="steam"
														placeholder={localizer.f('steamPath')}
														value={this.state.steamPath}
														onClick={this.steamPathBtnClickHandler.bind(this)}
														readOnly={true}
													/>
													<span className="input-group-btn">
														<button
															className="btn btn-default"
															type="button"
															onClick={this.steamPathBtnClickHandler.bind(this)}
														>
															<FontAwesomeIcon icon={faFolderOpen}/>
														</button>
													</span>
												</div>
												<span
													className="help-block"
													style={{ display: (this.state.steamError) ? ('inline') : ('none') }}
												>
													{localizer.f('pathError')}
												</span>
											</div>
										</div>
										<div style={{ display: (this.state.originEnabled) ? ('block') : ('none') }}>
											<hr/>
											<h3>{localizer.f('originConfig')}</h3>
											<div className={`form-group ${((this.state.originError) ? (' has-error') : (''))}`}>
												<label>{localizer.f('originGamesPath')}</label>
												<div className="input-group">
													<input
														className="form-control"
														name="origin"
														placeholder={localizer.f('originGamesPath')}
														value={this.state.originPath}
														onClick={this.originPathBtnClickHandler.bind(this)}
														readOnly={true}
													/>
													<span className="input-group-btn">
														<button
															className="btn btn-default"
															type="button"
															onClick={this.originPathBtnClickHandler.bind(this)}
														>
															<FontAwesomeIcon icon={faFolderOpen}/>
														</button>
													</span>
												</div>
												<span
													className="help-block"
													style={{ display: (this.state.originError) ? ('inline') : ('none') }}
												>
													{localizer.f('pathError')}
												</span>
											</div>
										</div>
										<div style={{ display: (this.state.emulatedEnabled) ? ('block') : ('none') }}>
											<hr/>
											<h3>{localizer.f('emulatedConfig')}</h3>
											<div className={`form-group ${((this.state.emulatedError) ? (' has-error') : (''))}`}>
												<label>{localizer.f('emulatedGamesPath')}</label>
												<div className="input-group">
													<input
														className="form-control"
														name="origin"
														placeholder={localizer.f('emulatedGamesPath')}
														value={this.state.emulatedPath}
														onClick={this.emulatedPathBtnClickHandler.bind(this)}
														readOnly={true}
													/>
													<span className="input-group-btn">
														<button
															className="btn btn-default"
															type="button"
															onClick={this.emulatedPathBtnClickHandler.bind(this)}
														>
															<FontAwesomeIcon icon={faFolderOpen}/>
														</button>
													</span>
												</div>
												<span
													className="help-block"
													style={{ display: (this.state.emulatedError) ? ('inline') : ('none') }}
												>
													{localizer.f('pathError')}
												</span>
											</div>
										</div>
									</div>
									<div id="options-pane-lang" className={`tab-pane fade ${css(styles.langSelect)}`}>
										<select
											name="lang"
											className="selectpicker"
											value={this.state.lang}
											onChange={this.langSelectChangeHandler.bind(this)}
										>
											{Object.keys(this.state.langs).map((langName: string, index: number) =>
												<option
													value={langName}
													key={index}
												>
													{this.state.langs[langName].language}
												</option>
											)}
										</select>
									</div>
									<div id="options-pane-emulators" className={`tab-pane fade in ${css(styles.tableDiv)}`}>
										<p className={css(styles.emulatorsError)}>{this.state.emulatorsError}</p>
										<table className={`table table-bordered ${css(styles.emulatorsTable)}`}>
											<thead>
											<tr>
												<th className={css(styles.emulatorNameTh)}>{localizer.f('emulatorName')}</th>
												<th className={css(styles.emulatorPlatformsTh)}>{localizer.f('emulatorPlatforms')}</th>
												<th className={css(styles.emulatorActiveTh)}>{localizer.f('emulatorActive')}</th>
												<th className={css(styles.emulatorPathTh)}>{localizer.f('emulatorPath')}</th>
												<th className={css(styles.emulatorCommandTh)}>{localizer.f('emulatorCommand')}</th>
											</tr>
											</thead>
											<tbody>
											{Object.keys(this.props.settings.emulated.emulators).map((emulatorId: string, index: number) =>
												<EmulatorSettingsRow
													key={index}
													id={emulatorId}
													emulator={this.props.settings.emulated.emulators[emulatorId]}
													platforms={this.props.settings.emulated.emulators[emulatorId].platforms.map(
														(platformsId) => this.props.settings.emulated.platforms[platformsId]
													)}
													onChange={this.emulatorConfigChangeHandler.bind(this)}
												/>
											)}
											</tbody>
										</table>
										<p className={css(styles.emulatorsCommandLineInstruction)}>{localizer.f('emulatorCommandLineInstruction')}</p>
									</div>
								</div>
							</form>
						</div>
						<div className="modal-footer">
							<button
								className="btn btn-default"
								style={{ display: (!this.props.firstLaunch) ? ('inline-block') : ('none') }}
								data-dismiss="modal"
							>
								{localizer.f('cancel')}
							</button>
							<button
								className="btn btn-success"
								onClick={this.submitBtnClickHandler.bind(this)}
							>
								{localizer.f('confirm')}
							</button>
						</div>
					</div>
				</div>
				{this.checkErrors()}
			</div>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	modal: {
		top: 10..vh()
	},
	modalDialog: {
		width: 900..px()
	},
	modalBody: {
		padding: padding(15, 40, 10),
		maxHeight: 63..vh(),
		overflowY: 'auto'
	},
	langSelect: {
		padding: padding(20, 0, 0)
	},
	navTabsLink: {
		':hover': {
			color: '#988F88',
			border: 'none'
		}
	},
	tableDiv: {
		maxHeight: 50..vh(),
		overflowY: 'auto'
	},
	emulatorsError: {
		color: '#A94442',
		marginTop: 15
	},
	emulatorsTable: {
		marginTop: 5,
		marginBottom: 5,
		fontSize: 14
	},
	emulatorNameTh: {
		width: 14..percents()
	},
	emulatorPlatformsTh: {
		width: 9..percents()
	},
	emulatorActiveTh: {
		width: 17..percents()
	},
	emulatorPathTh: {
		width: 30..percents()
	},
	emulatorCommandTh: {
		width: 30..percents()
	},
	emulatorsCommandLineInstruction: {
		fontSize: 14,
		marginBottom: 10,
		paddingLeft: 10,
		opacity: 0.5,
		float: 'right'
	},
});
