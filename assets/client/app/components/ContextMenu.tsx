import * as React from 'react';
import { Button, Modal } from 'semantic-ui-react';
import { css, StyleSheet } from 'aphrodite';
import { ContextMenu as ContextMenuDiv, MenuItem } from 'react-contextmenu';
import { margin } from 'css-verbose';

import { serverListener } from '../ServerListener';
import { VitrineComponent } from './VitrineComponent';
import { GamesCollection } from '../../../models/GamesCollection';
import { PlayableGame } from '../../../models/PlayableGame';
import { localizer } from '../Localizer';
import { openGameAddModal } from '../actions/modals';

interface Props {
	playableGames: GamesCollection<PlayableGame>
	launchGame: (launchedGame: PlayableGame) => void,
	setGameToEdit: (gameToEdit: PlayableGame) => void,
	openGameAddModal: () => void,
	openTimePlayedEditionModal: () => void
}

interface State {
	confirmVisible: boolean,
	toDeleteGame: PlayableGame
}

export class ContextMenu extends VitrineComponent<Props, State> {
	public constructor(props: Props) {
		super(props);

		this.state = {
			confirmVisible: false,
			toDeleteGame: null
		};
	}

	private contextAction(target: HTMLElement, action: string) {
		let gameUuid: string = target.children[0].id.replace('sidebar-game:', '');
		let game: PlayableGame = this.props.playableGames.getGame(gameUuid);

		switch (action) {
			case 'launch': {
				this.props.launchGame(game);
				break;
			}
			case 'edit': {
				this.props.setGameToEdit(game);
				this.props.openGameAddModal();
				break;
			}
			case 'editTime': {
				this.props.setGameToEdit(game);
				this.props.openTimePlayedEditionModal();
				break;
			}
			case 'delete': {
				this.setState({
					confirmVisible: true,
					toDeleteGame: game
				});
				break;
			}
		}
	}

	private removeGame() {
		serverListener.send('remove-game', this.state.toDeleteGame.uuid);
		this.resetModalData();
	}

	private resetModalData() {
		this.setState({
			confirmVisible: false,
			toDeleteGame: null
		});
	}

	public render(): JSX.Element {
		return (
			<div>
				<ContextMenuDiv id="sidebar-games-context-menu">
					<MenuItem onClick={(event: any, data: any, target: HTMLElement) => this.contextAction(target, 'launch')}>
						{localizer.f('play')}
					</MenuItem>
					<MenuItem onClick={(event: any, data: any, target: HTMLElement) => this.contextAction(target, 'edit')}>
						{localizer.f('edit')}
					</MenuItem>
					<MenuItem onClick={(event: any, data: any, target: HTMLElement) => this.contextAction(target, 'editTime')}>
						{localizer.f('editTimePlayed')}
					</MenuItem>
					<MenuItem divider={true}/>
					<MenuItem onClick={(event: any, data: any, target: HTMLElement) => this.contextAction(target, 'delete')}>
						{localizer.f('delete')}
					</MenuItem>
				</ContextMenuDiv>
				<Modal
					open={this.state.confirmVisible}
					onClose={this.resetModalData.bind(this)}
					className={css(styles.modal)}
				>
					<Modal.Header>{localizer.f('removeGame')}</Modal.Header>
					<Modal.Content
						dangerouslySetInnerHTML={{
							__html: localizer.f('removeGameText', (this.state.toDeleteGame) ? (this.state.toDeleteGame.name) : (''))
						}}
						className={css(styles.modalContent)}
					/>
					<Modal.Actions>
						<Button
							secondary={true}
							onClick={this.resetModalData.bind(this)}
						>
							{localizer.f('cancel')}
						</Button>
						<Button
							primary={true}
							onClick={this.removeGame.bind(this)}
						>
							{localizer.f('confirm')}
						</Button>
					</Modal.Actions>
				</Modal>
			</div>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	modal: {
		margin: margin(22..rem(), 'auto')
	},
	modalContent: {
		fontSize: 16
	}
});
