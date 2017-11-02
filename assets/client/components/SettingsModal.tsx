import * as React from 'react';
import { ipcRenderer } from 'electron';
import { StyleSheet, css } from 'aphrodite';
import { padding } from 'css-verbose';

import { VitrineComponent } from './VitrineComponent';
import { GamesModule } from './GamesModule';
import { localizer } from '../Localizer';
import { openDirectory } from '../helpers';

import * as steamIcon from '../images/steamIcon.png';
import * as originIcon from '../images/originIcon.png';

export class SettingsModal extends VitrineComponent {
	public constructor(props: any) {
		super(props);

		this.state = {
			langs: localizer.getLanguages(),
			lang: localizer.getSelectedLanguage(),
			steamEnabled: (this.props.settings && this.props.settings.steam) ? (true) : (false),
			originEnabled: (this.props.settings && this.props.settings.origin) ? (true) : (false),
			steamPath: (this.props.settings && this.props.settings.steam) ? (this.props.settings.steam.installFolder) : (''),
			originPath: (this.props.settings && this.props.settings.origin) ? (this.props.settings.origin.installFolder) : (''),
			steamError: false,
			originError: false
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

	private steamPathBtnClickHandler() {
		let steamPath: string = openDirectory();
		if (steamPath) {
			this.setState({
				steamPath: steamPath
			});
		}
	}

	private originPathBtnClickHandler() {
		let originPath: string = openDirectory();
		if (originPath) {
			this.setState({
				originPath: originPath
			});
		}
	}

	private langSelectChangeHandler(event: any) {
		let value: string = event.target.value;
		this.setState({
			lang: value
		});
	}

	private submitBtnClickHandler() {
		let form: any = {
			lang: this.state.lang
		};
		let canBeSent: boolean = true;
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
		if (canBeSent)
			ipcRenderer.send('client.update-settings', form);
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
				<div className="modal-dialog">
					<div className="modal-content">
						<div
							className="modal-header"
							style={{display: (!this.props.firstLaunch) ? ('block') : ('none')}}
						>
							{localizer.f('settings')}
						</div>
						<div className={`modal-body ${css(styles.modalBody)}`}>
							<form>
								<div style={{display: (this.props.firstLaunch) ? ('block') : ('none')}}>
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
										<a className={css(styles.navTabsLink)} data-toggle="tab" href="#options-pane-lang">
											{localizer.f('lang')}
										</a>
									</li>
								</ul>
								<div className="tab-content">
									<div id="options-pane-modules" className="tab-pane fade in active">
										<div className="row">
											<div className="col-md-offset-1 col-md-5">
												<GamesModule
													clicked={this.state.steamEnabled}
													iconFile={steamIcon}
													iconAlt={'Steam'}
													clickHandler={this.steamIconClickHandler.bind(this)}
												/>
											</div>
											<div className="col-md-6">
												<GamesModule
													clicked={this.state.originEnabled}
													iconFile={originIcon}
													iconAlt={'Origin'}
													clickHandler={this.originIconClickHandler.bind(this)}
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
														disabled
													/>
													<span className="input-group-btn">
														<button
															className="btn btn-default"
															type="button"
															onClick={this.steamPathBtnClickHandler.bind(this)}
														>
															<i className="fa fa-folder-open-o"/>
														</button>
													</span>
												</div>
												<span
													className="help-block"
													style={{display: (this.state.steamError) ? ('inline') : ('none')}}
												>
													{localizer.f('pathError')}
												</span>
											</div>
										</div>
										<div style={{display: (this.state.originEnabled) ? ('block') : ('none')}}>
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
														disabled
													/>
													<span className="input-group-btn">
														<button
															className="btn btn-default"
															type="button"
															onClick={this.originPathBtnClickHandler.bind(this)}
														>
															<i className="fa fa-folder-open-o"/>
														</button>
													</span>
												</div>
												<span
													className="help-block"
													style={{display: (this.state.originError) ? ('inline') : ('none')}}
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
								</div>
							</form>
						</div>
						<div className="modal-footer">
							<button
								className="btn btn-default"
								style={{display: (!this.props.firstLaunch) ? ('inline-block') : ('none')}}
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
	modalBody: {
		padding: padding(15, 40, 10)
	},
	langSelect: {
		padding: padding(20, 0, 0)
	},
	navTabsLink: {
		':hover': {
			color: '#988F88',
			border: 'none'
		}
	}
});
