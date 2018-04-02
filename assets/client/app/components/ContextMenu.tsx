import { css, StyleSheet } from 'aphrodite';
import { margin } from 'css-verbose';
import * as React from 'react';
import { ContextMenu as ContextMenuDiv, MenuItem } from 'react-contextmenu';
import { Button, Modal } from 'semantic-ui-react';

import { GamesCollection } from '../../../models/GamesCollection';
import { PlayableGame } from '../../../models/PlayableGame';
import { localizer } from '../Localizer';
import { serverListener } from '../ServerListener';
import { VitrineComponent } from './VitrineComponent';

interface Props {
	playableGames: GamesCollection<PlayableGame>;
	launchGame: (launchedGame: PlayableGame) => void;
	setGameToEdit: (gameToEdit: PlayableGame) => void;
	openGameAddModal: () => void;
	openTimePlayedEditionModal: () => void;
}

interface State {
	confirmVisible: boolean;
	toDeleteGame: PlayableGame;
}

export class ContextMenu extends VitrineComponent<Props, State> {
	public constructor(props: Props) {
		super(props);

		this.state = {
			confirmVisible: false,
			toDeleteGame: null
		};

		this.removeGame = this.removeGame.bind(this);
		this.resetModalData = this.resetModalData.bind(this);
		this.launchClick = this.launchClick.bind(this);
		this.editClick = this.editClick.bind(this);
		this.editTimeClick = this.editTimeClick.bind(this);
		this.deleteClick = this.deleteClick.bind(this);
	}

	private launchClick(event: any, data: any, target: HTMLElement) {
		this.contextAction(target, 'launch');
	}

	private editClick(event: any, data: any, target: HTMLElement) {
		this.contextAction(target, 'edit');
	}

	private editTimeClick(event: any, data: any, target: HTMLElement) {
		this.contextAction(target, 'editTime');
	}

	private deleteClick(event: any, data: any, target: HTMLElement) {
		this.contextAction(target, 'delete');
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

	private contextAction(target: HTMLElement, action: string) {
		const gameUuid: string = target.children[0].id.replace('sidebar-game:', '');
		const game: PlayableGame = this.props.playableGames.getGame(gameUuid);

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

	public render(): JSX.Element {
		return (
			<div>
				<ContextMenuDiv id={'sidebar-games-context-menu'}>
					<MenuItem onClick={this.launchClick}>
						{localizer.f('play')}
					</MenuItem>
					<MenuItem onClick={this.editClick}>
						{localizer.f('edit')}
					</MenuItem>
					<MenuItem onClick={this.editTimeClick}>
						{localizer.f('editTimePlayed')}
					</MenuItem>
					<MenuItem divider={true}/>
					<MenuItem onClick={this.deleteClick}>
						{localizer.f('delete')}
					</MenuItem>
				</ContextMenuDiv>
				<Modal
					open={this.state.confirmVisible}
					onClose={this.resetModalData}
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
							onClick={this.resetModalData}
						>
							{localizer.f('cancel')}
						</Button>
						<Button
							primary={true}
							onClick={this.removeGame}
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
