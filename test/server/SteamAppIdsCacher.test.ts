import * as path from 'path';

import { getEnvFolder } from '../../sources/models/env';
import { SteamAppIdsCacher } from '../../sources/server/SteamAppIdsCacher';

function testSteamAppIdsCacher(prod?: boolean) {
	return () => {
		let steamAppIdsCacher: SteamAppIdsCacher;
		let cacheFilePath: string;
		const steamAppKey: any = 400;
		const steamAppData: any = { [steamAppKey]: 'Portal'};

		before(async () => {
			process.env.NODE_ENV = (prod) ? ('prod') : ('dev');
			process.env.TEST_PROD = (prod) ? ('true') : ('false');
			steamAppIdsCacher = new SteamAppIdsCacher();
			cacheFilePath = path.resolve(getEnvFolder('config'), 'cache', 'steam_app_ids.json');
		});

		function cacheGame() {
			return async () => {
				const [ cachedSteamAppData ]: any = await steamAppIdsCacher.cache([ steamAppKey ]);
				cachedSteamAppData.appId.should.equal(steamAppKey);
				cachedSteamAppData.name.should.equal(steamAppData[steamAppKey]);
			};
		}

		it('Cache a Steam app', cacheGame());

		it('Get back a cached Steam app', cacheGame());

		after(async () => {
			await steamAppIdsCacher.invalidCache();
		});
	};
}

describe('SteamAppIdsCacher.ts', () => {
	describe('Dev env', testSteamAppIdsCacher());
	describe('Prod env', testSteamAppIdsCacher(true));
});
