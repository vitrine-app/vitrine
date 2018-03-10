import * as React from 'react';
import { Grid, Modal } from 'semantic-ui-react';
import { StyleSheet, css } from 'aphrodite';
import { margin, padding } from 'css-verbose';

import { GamesCollection } from '../../../models/GamesCollection';
import { PotentialGame } from '../../../models/PotentialGame';
import { VitrineComponent } from './VitrineComponent';
import { BlurPicture } from './BlurPicture';
import { localizer } from '../Localizer';

import { faPlusCircle } from '@fortawesome/fontawesome-free-solid';

interface Props {
	potentialGames: GamesCollection<PotentialGame>,
	visible: boolean,
	setPotentialGameToAdd: (potentialGame: PotentialGame) => void,
	openGameAddModal: () => void,
	closePotentialGamesAddModal: () => void
}

export class PotentialGamesAddModal extends VitrineComponent<Props, {}> {
	private gameCoverClickHandler(potentialGame: PotentialGame) {
		this.props.setPotentialGameToAdd(potentialGame);
		this.props.closePotentialGamesAddModal();
		this.props.openGameAddModal();
	}

	private closeModal() {
		this.props.closePotentialGamesAddModal();
	}

	public render(): JSX.Element {
		return (
			<Modal
				open={this.props.visible}
				onClose={this.closeModal.bind(this)}
				className={css(styles.modal)}
			>
				<Modal.Header>{localizer.f('addGames')}</Modal.Header>
				<Modal.Content>
					<Grid>
						{this.props.potentialGames.map((potentialGame: PotentialGame, index: number) =>
							<Grid.Column width={3} key={index}>
								<div className={css(styles.coverWrapper)}>
									<BlurPicture
										faIcon={faPlusCircle}
										fontSize={55}
										background={potentialGame.details.cover}
										clickHandler={this.gameCoverClickHandler.bind(this, potentialGame)}
									/>
								</div>
								<p>{potentialGame.name}</p>
							</Grid.Column>
						)}
					</Grid>
				</Modal.Content>
				{this.checkErrors()}
			</Modal>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	modal: {
		margin: margin(15..rem(), 'auto')
	},
	coverWrapper: {
		height: 200
	},
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
