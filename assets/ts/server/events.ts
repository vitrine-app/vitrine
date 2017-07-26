import { IgdbWrapper } from './api/IgdbWrapper';

let igdbWrapper = new IgdbWrapper();

export const events = {
	'client.get-game': (event, gameName) => {
		igdbWrapper.getGame(gameName, (game) => {
			event.sender.send('server.send-game', game);
		}, (error) => {
			event.sender.send('server.send-game-error', error);
		});
	}
};
