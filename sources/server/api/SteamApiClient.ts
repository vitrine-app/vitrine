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

  public async getGamesDetails(appId: number) {
    const apiEndPoint: string = 'https://store.steampowered.com/api/appdetails/';
    const { data }: AxiosResponse<any> = await axios.get(`${apiEndPoint}?appids=${appId}`);
    return data;
  }
}

export const steamApiClient: SteamApiClient = new SteamApiClient();
