import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { remote } from 'electron';

import './AddGameModal.scss';
import { BlurPicture } from '../BlurPicture/BlurPicture';
import { NumberPicker } from '../NumberPicker/NumberPicker';
import { localizer } from '../../Localizer';

export class AddGameModal extends React.Component<any, any> {
	public constructor() {
		super();

		this.state = {
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
			source: ''
		};
	}

	public componentDidMount() {
		$(findDOMNode(this)).on('hidden.bs.modal', this.hideModalHandler.bind(this));
	}

	public render() {
		return (
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
									<form id="add-game-form" onSubmit={(event) => { event.preventDefault(); console.log(this.state) }}>
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
													min={ 0 }
													max={ 5 }
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
											<button id="add-custom-background-btn" className="btn btn-primary">
												<i className="fa fa-plus"/> { localizer.f('addCustomBgImage') }
											</button>
											<div id="add-background-picker"/>
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
								id="fill-with-igdb-btn"
								className="btn btn-primary"
								disabled={!this.state.name}
							>
								{ localizer.f('fillWithIgdb') }
							</button>
							<button
								id="add-game-submit-btn"
								className="btn btn-primary"
								disabled={!this.state.name || !this.state.executable}
							>
								{ localizer.f('submitNewGame') }
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	private hideModalHandler() {
		this.setState({
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
			source: ''
		});
	}

	private gameCoverClickHandler() {
		let dialogRet: string[] = remote.dialog.showOpenDialog({
			properties: ['openFile'],
			filters: [
				{
					name: localizer.f('images'),
					extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp']
				}
			]
		});
		if (!dialogRet || !dialogRet.length)
			return;
		this.setState({
			cover: dialogRet[0]
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
}
