import axios, { AxiosInstance, AxiosResponse } from 'axios';

import { steamKey } from '../../modules/keysProvider';

class SteamApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `http://api.steampowered.com`,
      params: {
        format: 'json',
        key: steamKey()
      }
    });
  }

  public async getOwnedGames(steamId: string) {
    const {
      data: {
        response: { games }
      }
    }: AxiosResponse<any> = await this.client.get('/IPlayerService/GetOwnedGames/v0001', {
      params: {
        steamid: steamId
      }
    });
    return games;
  }
}

export const steamApiClient: SteamApiClient = new SteamApiClient();
