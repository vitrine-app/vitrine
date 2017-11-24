import * as React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { padding } from 'css-verbose';

import { VitrineComponent } from './VitrineComponent';
import { PotentialGame } from '../../models/PotentialGame';
import { BlurPicture } from './BlurPicture';
import { localizer } from '../Localizer';

export class AddPotentialGamesModal extends VitrineComponent {
	public constructor(props: any) {
		super(props)
	}

	private gameCoverClickHandler(potentialGame: PotentialGame) {
		this.props.potentialGameUpdateCallback(potentialGame);
	}

	public render(): JSX.Element {
		return (
			<div id="add-potential-games-modal" className="modal fade" role="dialog">
				<div className="modal-dialog modal-lg">
					<div className="modal-content">
						<div className="modal-header">
							<button type="button" className="close" data-dismiss="modal">&times;</button>
							<h4 className="modal-title">{localizer.f('addGames')}</h4>
						</div>
						<div className="modal-body">
							<div className={`row ${css(styles.potentialGamesRow)}`}>
								{this.props.potentialGames.games.map((potentialGame: PotentialGame, index: number) =>
									<div key={index} className={`col-md-3 ${css(styles.potentialGameCell)}`}>
										<BlurPicture
											faIcon={'plus-circle'}
											fontSize={55}
											background={potentialGame.details.cover}
											clickHandler={this.gameCoverClickHandler.bind(this, potentialGame)}
										/>
										<p>{potentialGame.name}</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
				{this.checkErrors()}
			</div>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	potentialGamesRow: {
		padding: padding(15, 0, 15, 50),
		maxHeight: 810,
		overflowY: 'auto'
	},
	potentialGameCell: {
		height: 300
	},
	potentialGameName: {
		fontWeight: 300,
		fontSize: 18,
		marginLeft: 40
	},
	potentialGameCover: {
		paddingBottom: 20
	}
});
