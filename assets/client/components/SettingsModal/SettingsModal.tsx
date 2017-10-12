import * as React from 'react';

import { VitrineComponent } from '../VitrineComponent';
import { GamesModule } from '../GamesModule/GamesModule';
import { localizer } from '../../Localizer';
import { openDirectory } from '../../helpers';

import './SettingsModal.scss';
import * as steamIcon from './steamIcon.png';
import * as originIcon from './originIcon.png';

export class SettingsModal extends VitrineComponent {
	public constructor() {
		super();

		this.state = {
			langs: localizer.getLanguages(),
			lang: localizer.getSelectedLanguage(),
			steamEnabled: false,
			originEnabled: false,
			steamPath: '',
			originPath: ''
		};
	}

	private steamIconClickHandler(checked: boolean) {
		if ((checked && !this.state.steamEnabled) || (!checked && this.state.steamEnabled)) {
			this.setState({
				steamEnabled: !this.state.steamEnabled
			});
		}
	}

	private originIconClickHandler(checked: boolean) {
		if ((checked && !this.state.originEnabled) || (!checked && this.state.originEnabled)) {
			this.setState({
				originEnabled: !this.state.originEnabled
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
		if (this.state.steamEnabled)
			form.steamPath = this.state.steamPath;
		if (this.state.originEnabled)
			form.steamPath = this.state.originPath;
		console.log(form);
	}

	public render(): JSX.Element {
		return (
			<div id="settings-modal" className="modal fade" role="dialog" data-keyboard="false" data-backdrop="static">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-body">
							<form id="settings-form">
								<h1>{ localizer.f('welcomeMessage') }</h1>
								<p>{ localizer.f('wizardText') }</p>
								<ul className="nav nav-tabs">
									<li className="active"><a data-toggle="tab" href="#options-pane-modules">Modules</a></li>
									<li><a data-toggle="tab" href="#options-pane-lang">Lang</a></li>
								</ul>
								<div className="tab-content">
									<div id="options-pane-modules" className="tab-pane fade in active">
										<GamesModule
											iconFile={ steamIcon }
											iconAlt={ 'Steam' }
											clickHandler={ this.steamIconClickHandler.bind(this) }
										/>
										<GamesModule
											iconFile={ originIcon }
											iconAlt={ 'Origin' }
											clickHandler={ this.originIconClickHandler.bind(this) }
										/>
										<div style={ {display: (this.state.steamEnabled) ? ('block') : ('none')} }>
											<hr/>
											<h3>{ localizer.f('steamConfig') }</h3>
											<div className="form-group">
												<label>{ localizer.f('steamPath') }</label>
												<div className="input-group">
													<input
														className="form-control"
														name="steam"
														placeholder={ localizer.f('steamPath') }
														value={ this.state.steamPath }
														disabled
													/>
													<span className="input-group-btn">
														<button
															className="btn btn-default"
															type="button"
															onClick={ this.steamPathBtnClickHandler.bind(this) }
														>
															<i className="fa fa-folder-open-o"/>
														</button>
													</span>
												</div>
											</div>
										</div>
										<div style={ {display: (this.state.originEnabled) ? ('block') : ('none')} }>
											<hr/>
											<h3>{ localizer.f('originConfig') }</h3>
											<div className="form-group">
												<label>{ localizer.f('originGamesPath') }</label>
												<div className="input-group">
													<input
														className="form-control"
														name="origin"
														placeholder={ localizer.f('originGamesPath') }
														value={ this.state.originPath }
														disabled
													/>
													<span className="input-group-btn">
														<button
															className="btn btn-default"
															type="button"
															onClick={ this.originPathBtnClickHandler.bind(this) }
														>
															<i className="fa fa-folder-open-o"/>
														</button>
													</span>
												</div>
											</div>
										</div>
									</div>
									<div id="options-pane-lang" className="tab-pane fade lang-select">
										<select
											name="lang"
											className="selectpicker"
											value={ this.state.lang }
											onChange={ this.langSelectChangeHandler.bind(this) }
										>
											{ Object.keys(this.state.langs).map((langName: string, index: number) =>
												<option
													value={ langName }
													key={ index }
												>
													{ this.state.langs[langName].language }
												</option>
											) }
										</select>
									</div>
								</div>
							</form>
						</div>
						<div className="modal-footer">
							<button
								className="btn btn-success"
								onClick={ this.submitBtnClickHandler.bind(this) }
							>
								{ localizer.f('confirm') }
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
