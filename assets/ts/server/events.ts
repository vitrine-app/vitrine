import { IgdbWrapper } from './api/IgdbWrapper';

let igdbWrapper = new IgdbWrapper();

export const events = {
	'client.get-game': (event, gameName) => {
		igdbWrapper.getGame(gameName, (error, game) => {
			if (error)
				event.sender.send('server.send-game-error', error);
			else
				event.sender.send('server.send-game', game);
		});
	}
};
