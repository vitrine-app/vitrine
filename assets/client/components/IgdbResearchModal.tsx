import * as React from 'react';
import { ipcRenderer } from 'electron';
import { StyleSheet, css } from 'aphrodite';

import { VitrineComponent } from './VitrineComponent';
import { NumberPicker } from './NumberPicker';
import { localizer } from '../Localizer';

export class IgdbResearchModal extends VitrineComponent {
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

	public render(): JSX.Element {
		return (
			<div id="igdb-research-modal" className="modal fade" role="dialog">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<button type="button" className="close" data-dismiss="modal">&times;</button>
							<h4 className="modal-title">{localizer.f('fillWithIgdb')}</h4>
						</div>
						<div className={`modal-body ${css(styles.modalBody)}`}>
							<form>
								<div className="row">
									<div className="form-group col-md-8">
										<label>{localizer.f('gameName')}</label>
										<input
											className="form-control"
											name="name"
											placeholder={localizer.f('gameName')}
											value={this.state.research}
											onChange={this.changeResearchHandler.bind(this)}
										/>
									</div>
									<div className="form-group col-md-3">
										<label>{localizer.f('resultsNumber')}</label>
										<NumberPicker
											min={1}
											max={20}
											value={this.state.resultsNb}
											name="rating"
											placeholder={localizer.f('resultsNumber')}
											onChange={this.changeResultsNbHandler.bind(this)}
										/>
									</div>
									<div className={`col-md-1 ${css(styles.igdbResearchBtnDiv)}`}>
										<button
											className="btn btn-primary"
											type="button"
											onClick={this.igdbSearchBtnClick.bind(this)}
										>
											<i className="fa fa-search"/>
										</button>
									</div>
								</div>
								{this.state.researches.map((research: any, index: number) =>
									<div
										key={index}
										className={
											'row ' + css(styles.igdbResearchList) + ' ' +
											((this.state.selectedResearchId === research.id) ? (css(styles.selectedIgdbResearch)) : (''))
										}
										onClick={this.clickResearchHandler.bind(this, research.id)}
									>
										<div className="col-md-3">
											<img src={research.cover} className={css(styles.igdbResearchImg)}/>
										</div>
										<span className={css(styles.igdbResearchName)}>{research.name}</span>
									</div>
								)}
								<input name="game-id" hidden/>
							</form>
						</div>
						<div className="modal-footer">
							<button
								id="submit-igdb-research-btn"
								className="btn btn-primary"
								disabled={!this.state.selectedResearchId}
								onClick={this.igdbFillBtnClick.bind(this)}
							>
								{localizer.f('submitNewGame')}
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
	modalBody: {
		height: 500,
		overflowY: 'auto'
	},
	igdbResearchBtnDiv: {
		paddingTop: 4 + '%',
		paddingLeft: 0
	},
	igdbResearchList: {
		marginTop: 5,
		marginBottom: 5,
		marginLeft: 0,
		marginRight: 0,
		borderRadius: 2,
		paddingTop: 10,
		paddingBottom: 10,
		paddingLeft: 0,
		paddingRight: 0,
		backgroundColor: '#39342E',
		':hover': {
			backgroundColor: 'rgba(247, 210, 174, 0.1)'
		}
	},
	selectedIgdbResearch: {
		border: 'solid #81705E 2px',
		fontWeight: 600
	},
	igdbResearchImg: {
		width: 90,
		height: 120,
		boxShadow: '0 0 5px rgba(12, 12, 12, 0.33)'
	},
	igdbResearchName: {
		top: 48
	}
});
