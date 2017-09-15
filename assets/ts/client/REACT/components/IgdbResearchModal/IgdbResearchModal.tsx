import * as React from 'react';
import { ipcRenderer } from 'electron';

import './IgdbResearchModal.scss';
import { NumberPicker } from '../NumberPicker/NumberPicker';
import { localizer } from '../../Localizer';

export class IgdbResearchModal extends React.Component<any, any> {
	public constructor(props: any) {
		super(props);

		this.state = {
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

	private igdbSearchBtnClick() {
		ipcRenderer.send('client.search-igdb-games', this.state.research, this.state.resultsNb);
	}

	private igdbFillBtnClick() {
		ipcRenderer.send('client.fill-igdb-game', this.state.selectedResearchId);
	}

	public componentDidMount() {
		ipcRenderer.on('server.send-igdb-searches', (event: Electron.Event, research: string, researches: any[]) => {
			this.setState({
				research: research,
				researches: researches,
				selectedResearchId: ''
			}, () => {
				$('#igdb-research-modal').modal('show');
			});
		});
	}

	public render() {
		return (
			<div id="igdb-research-modal" className="modal fade" role="dialog">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<button type="button" className="close" data-dismiss="modal">&times;</button>
							<h4 className="modal-title">{ localizer.f('fillWithIgdb') }</h4>
						</div>
						<div className="modal-body">
							<form id="igdb-research-form">
								<div className="row">
									<div className="form-group col-md-8">
										<label>{ localizer.f('gameName') }</label>
										<input
											className="form-control"
											name="name"
											placeholder={ localizer.f('gameName') }
											value={ this.state.research }
											onChange={ this.changeResearchHandler.bind(this) }
										/>
									</div>
									<div className="form-group col-md-3">
										<label>{ localizer.f('resultsNumber') }</label>
										<NumberPicker
											min={ 1 }
											max={ 20 }
											value={ this.state.resultsNb }
											name="rating"
											placeholder={ localizer.f('resultsNumber') }
											onChange={ this.changeResultsNbHandler.bind(this) }
										/>
									</div>
									<div id="igdb-research-btn-div" className="col-md-1">
										<button
											id="igdb-new-research-btn"
											className="btn btn-primary"
											type="button"
											onClick={ this.igdbSearchBtnClick.bind(this) }
										>
											<i className="fa fa-search"/>
										</button>
									</div>
								</div>
								<div className="igdb-researches-list">
									{ this.state.researches.map((research: any) =>
										<div
											key={ research.id }
											className={ (this.state.selectedResearchId === research.id) ? ('row selected-igdb-research') : ('row') }
											onClick={ this.clickResearchHandler.bind(this, research.id) }
										>
											<div className="col-md-3">
												<img src={ research.cover }/>
											</div>
											<span className="col-md-9">{ research.name }</span>
										</div>
									) }
								</div>
								<input name="game-id" hidden/>
							</form>
						</div>
						<div className="modal-footer">
							<button
								id="submit-igdb-research-btn"
								className="btn btn-primary"
								disabled={ !this.state.selectedResearchId }
								onClick={ this.igdbFillBtnClick.bind(this) }
							>
								{ localizer.f('submitNewGame') }
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
