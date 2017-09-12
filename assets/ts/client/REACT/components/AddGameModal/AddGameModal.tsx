import * as React from 'react';
import { remote } from 'electron';

import './AddGameModal.scss';
import { BlurPicture } from '../BlurPicture/BlurPicture';
import { NumberPicker } from '../NumberPicker/NumberPicker';

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

	public render() {
		return (
			<div id="add-game-modal" className="modal fade" role="dialog">
				<div className="modal-dialog modal-lg">
					<div className="modal-content">
						<div className="modal-header">
							<button type="button" className="close" data-dismiss="modal">&times;</button>
							<h4 className="modal-title">-- addGameLabel --</h4>
						</div>
						<div className="modal-body">
							<div className="row">
								<div className="col-md-2">
									<BlurPicture
										faIcon={ 'folder-open-o' }
										fontSize={ 55 }
										clickHandler={ () => { console.log(':)')} }
									/>
								</div>
								<div className="col-md-7 col-md-offset-1">
									<form id="add-game-form" onSubmit={(event) => { event.preventDefault(); console.log(this.state) }}>
										<div className="form-group">
											<label>-- gameName --</label>
											<input
												className="form-control"
												name="name"
												placeholder="-- gameName --"
												value={ this.state.name }
												onChange={ this.inputChangeHandler.bind(this) }
											/>
										</div>
										<div className="row">
											<div className="form-group col-md-8">
												<label>-- gamesSeries --</label>
												<input
													className="form-control"
													name="series"
													placeholder="-- gamesSeries --"
													value={ this.state.series }
													onChange={ this.inputChangeHandler.bind(this) }
												/>
											</div>
											<div className="form-group col-md-4">
												<label>-- releaseDate --</label>
												<input
													className="form-control"
													name="date"
													placeholder="-- releaseDate --"
													value={ this.state.date }
													onChange={ this.inputChangeHandler.bind(this) }
												/>
											</div>
										</div>
										<div className="row">
											<div className="form-group col-md-6">
												<label>-- developer --</label>
												<input
													className="form-control"
													name="developer"
													placeholder="-- developer --"
													value={ this.state.developer }
													onChange={ this.inputChangeHandler.bind(this) }
												/>
											</div>
											<div className="form-group col-md-6">
												<label>-- publisher --</label>
												<input
													className="form-control"
													name="publisher"
													placeholder="-- publisher --"
													value={ this.state.publisher }
													onChange={ this.inputChangeHandler.bind(this) }
												/>
											</div>
										</div>
										<div className="row">
											<div className="form-group col-md-10">
												<label>-- genres --</label>
												<input
													className="form-control"
													name="genres"
													placeholder="-- genres --"
													value={ this.state.genres }
													onChange={ this.inputChangeHandler.bind(this) }
												/>
											</div>
											<div className="form-group col-md-2">
												<label>-- rating --</label>
												<NumberPicker
													min={ 0 }
													max={ 100 }
													placeholder="-- rating --"
													value={ this.state.rating }
													onChange={ this.ratingChangeHandler.bind(this) }
												/>
												{/*<input
													type="number"
													className="form-control"
													name="rating"
													min="0"
													max="100"
													placeholder="-- rating --"
													value={ this.state.rating }
													onChange={ this.inputChangeHandler.bind(this) }
												/>*/}
											</div>
										</div>
										<div className="form-group">
											<label>-- summary --</label>
											<textarea
												className="form-control"
												name="summary"
												placeholder="-- summary --"
												value={ this.state.summary }
												onChange={ this.inputChangeHandler.bind(this) }
											/>
										</div>
										<hr/>
										<div className="form-group">
											<label>-- executable --</label>
											<div className="input-group">
												<input
													className="form-control"
													name="executable"
													placeholder="-- executable --"
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
											<label>-- lineArguments --</label>
											<input
												className="form-control"
												name="arguments"
												placeholder="-- lineArguments --"
												value={ this.state.arguments }
												onChange={ this.inputChangeHandler.bind(this) }
											/>
										</div>
										<hr/>
										<div className="form-group">
											<label>-- backgroundImage --</label>
											<button id="add-custom-background-btn" className="btn btn-primary">
												<i className="fa fa-plus"/> -- addCustomBgImage --
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
							<button id="fill-with-igdb-btn" className="btn btn-primary" disabled>-- fillWithIgdb --</button>
							<button id="add-game-submit-btn" className="btn btn-primary" disabled>-- submitNewGame --</button>
						</div>
					</div>
				</div>
			</div>
		);
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
					name: '--executables--',
					extensions: ['exe']
				},
				{
					name:'--allFiles--',
					extensions: ['*']
				}
			]
		});
		if (dialogRet)
			this.setState({
				executable: dialogRet[0]
			});
	}
}
