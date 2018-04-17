import { css, StyleSheet } from 'aphrodite';
import { margin } from 'css-verbose';
import * as React from 'react';
import { Grid, Modal } from 'semantic-ui-react';

import { GamesCollection } from '../../../models/GamesCollection';
import { PotentialGame } from '../../../models/PotentialGame';
import { localizer } from '../Localizer';
import { BlurPicture } from './BlurPicture';

import { faPlusCircle } from '@fortawesome/fontawesome-free-solid';

interface Props {
	potentialGames: GamesCollection<PotentialGame>;
	visible: boolean;
	setPotentialGameToAdd: (potentialGame: PotentialGame) => void;
	openGameAddModal: () => void;
	closePotentialGamesAddModal: () => void;
}

export const PotentialGamesAddModal: React.StatelessComponent<Props> = (props: Props) => {
	const gameCoverClickHandler = (potentialGame: PotentialGame) => {
		props.setPotentialGameToAdd(potentialGame);
		props.closePotentialGamesAddModal();
		props.openGameAddModal();
	};

	return (
		<Modal
			open={props.visible}
			onClose={props.closePotentialGamesAddModal}
			className={css(styles.modal)}
		>
			<Modal.Header>{localizer.f('addGames')}</Modal.Header>
			<Modal.Content>
				<Grid>
					{props.potentialGames.map((potentialGame: PotentialGame, index: number) =>
						<Grid.Column width={3} key={index}>
							<div className={css(styles.coverWrapper)}>
								<BlurPicture
									faIcon={faPlusCircle}
									fontSize={55}
									background={potentialGame.details.cover}
									clickHandler={gameCoverClickHandler.bind(null, potentialGame)}
								/>
							</div>
							<p className={css(styles.potentialGameName)}>
								{potentialGame.name}
							</p>
						</Grid.Column>
					)}
				</Grid>
			</Modal.Content>
		</Modal>
	);
};

const styles: React.CSSProperties & any = StyleSheet.create({
	modal: {
		margin: margin(3..rem(), 'auto'),
		cursor: 'default',
		userSelect: 'none'
	},
	coverWrapper: {
		height: 200
	},
	potentialGameName: {
		fontSize: 17,
		marginTop: 6
	}
});
