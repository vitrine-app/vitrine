import { getSteamGamePlayTime } from '../../../sources/server/api/SteamPlayTimeWrapper';

describe('SteamPlayTimeWrapper', () => {
	const steamUserId: string = '76561198043489154';
	const steamId: number = 620;

	it('Return a number', async () => {
		const timePlayed: number = await getSteamGamePlayTime(steamUserId, steamId);
		timePlayed.should.be.a('number');
	});
});
