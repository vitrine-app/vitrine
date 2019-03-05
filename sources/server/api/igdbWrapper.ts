import { default as apicalypse } from 'apicalypse';

import { igdbKey } from '../../modules/keysProvider';
import { logger } from '../Logger';

const baseUrl = 'https://api-v3.igdb.com';
const defaultCover = 'https://images.igdb.com/igdb/image/upload/t_cover_big_2x/nocover_qhhlj6.jpg';

const options = {
  headers: {
    accept: 'application/json',
    'user-key': igdbKey()
  }
};

async function getImages(coverId: number, screenshotsIds: number[] = []) {
  let cover: string = defaultCover;
  if (coverId) {
    const {
      data: [{ url }]
    } = await apicalypse(options)
      .fields('url')
      .where(`id = ${coverId}`)
      .request(`${baseUrl}/covers`);
    cover = `https:${url.replace('t_thumb', 't_cover_big_2x')}`;
  }
  if (!screenshotsIds.length) {
    return { cover, screenshots: [] };
  }
  const { data: screenshots } = await apicalypse(options)
    .fields('url')
    .where(`id = (${screenshotsIds.join(',')})`)
    .request(`${baseUrl}/screenshots`);
  return {
    cover,
    screenshots: screenshots.map(({ url }) => `https:${url.replace('t_thumb', 't_1080p')}`)
  };
}

async function getCovers(coversIds: number[]) {
  if (!coversIds.length) {
    return [];
  }
  const { data: covers } = await apicalypse(options)
    .fields('url')
    .where(`id = (${coversIds.map(coverId => coverId || 0).join(',')})`)
    .request(`${baseUrl}/covers`);
  if (covers.length === coversIds.length) {
    return covers.map(({ id, url }) => ({
      id,
      url: `https:${url.replace('t_thumb', 't_cover_big_2x')}`
    }));
  }
  return coversIds.map(coverId => {
    const cover = covers.find(({ id }) => coverId === id);
    return {
      id: coverId,
      url: cover ? `https:${cover.url.replace('t_thumb', 't_cover_big_2x')}` : defaultCover
    };
  });
}

async function getInvolvedCompanies(involvedCompaniesIds: number[]) {
  if (!involvedCompaniesIds) {
    return { developer: '', publisher: '' };
  }
  const { data: involvedCompanies } = await apicalypse(options)
    .fields(['company', 'developer', 'publisher'])
    .where(`id = (${involvedCompaniesIds.join(',')})`)
    .request(`${baseUrl}/involved_companies`);
  const formattedInvolvedCompanies = [
    involvedCompanies.find(({ developer }) => developer),
    involvedCompanies.find(({ publisher }) => publisher)
  ].filter(company => company);
  const { data: companies } = await apicalypse(options)
    .fields('name')
    .where(`id = (${formattedInvolvedCompanies.map(({ company }) => company).join(',')})`)
    .request(`${baseUrl}/companies`);
  if (companies.length === 1) {
    return { developer: companies[0].name, publisher: companies[0].name };
  }
  return { developer: companies[0].name, publisher: companies[1].name };
}

async function getGenres(genresIds: number[]) {
  if (!genresIds) {
    return [];
  }
  const { data: genres } = await apicalypse(options)
    .fields('name')
    .where(`id = (${genresIds.join(',')})`)
    .request(`${baseUrl}/genres`);
  return genres.map(({ name }) => name);
}

async function getReleaseDate(releaseDateId: number) {
  if (!releaseDateId) {
    return null;
  }
  const {
    data: [releaseDate]
  } = await apicalypse(options)
    .fields('date')
    .where(`id = ${releaseDateId}`)
    .request(`${baseUrl}/release_dates`);
  return releaseDate.date;
}

async function getSeries(collectionId: number) {
  if (!collectionId) {
    return null;
  }
  const {
    data: [series]
  } = await apicalypse(options)
    .fields('name')
    .where(`id = ${collectionId}`)
    .request(`${baseUrl}/collections`);
  return series.name;
}

export async function searchGame(name: string, listSize: number = 5) {
  try {
    logger.info('igdbWrapper', `Connecting to IGDB API to look for ${listSize} game(s) named "${name}".`);
    const { data: games } = await apicalypse(options)
      .fields(['cover', 'name'])
      .search(name)
      .limit(listSize)
      .request(`${baseUrl}/games`);
    const covers = await getCovers(games.map(({ cover }) => cover));
    logger.info('igdbWrapper', `${games.length} games found for the occurrence "${name}".`);
    return games.map(game => ({
      ...game,
      cover: covers.find(({ id }) => id === game.cover).url
    }));
  } catch (error) {
    if (error.response) {
      throw new Error(`Server error: Searching for ${name}, got ${error.response.statusText}`);
    } else {
      throw new Error(`Server error: ${error.message}`);
    }
  }
}

export async function getFirstGame(name: string, locale?: string) {
  try {
    const {
      data: [data]
    } = await apicalypse(options)
      .fields([
        'name',
        'involved_companies',
        'cover',
        'genres',
        'rating',
        'release_dates',
        'screenshots',
        'storyline',
        'summary',
        'slug',
        'collection'
      ])
      .search(name)
      .limit(1)
      .request(`${baseUrl}/games`);
    const [genres, releaseDate, { developer, publisher }, { cover, screenshots }, series] = await Promise.all([
      getGenres(data.genres),
      getReleaseDate(data.release_dates ? data.release_dates[0] : null),
      getInvolvedCompanies(data.involved_companies),
      getImages(data.cover, data.screenshots),
      getSeries(data.collection)
    ]);
    // TODO: Re-implement translation
    const { rating, storyline, summary, ...game } = data;
    return {
      ...game,
      cover,
      developer,
      genres,
      publisher,
      rating: Math.round(rating),
      releaseDate,
      screenshots,
      series,
      summary: storyline || summary
    };
  } catch (error) {
    if (error.response) {
      throw new Error(`Server error: Searching for ${name}, got "${error.response.statusText}"`);
    } else {
      throw new Error(`Server error: Searching for ${name}, got "${error.message}"`);
    }
  }
}

export async function getGameById(igdbId: number, locale?: string) {
  logger.info('igdbWrapper', `Connecting to IGDB API to look for game with IGDB id "${igdbId}".`);
  try {
    const {
      data: [data]
    } = await apicalypse(options)
      .fields([
        'name',
        'involved_companies',
        'cover',
        'genres',
        'rating',
        'release_dates',
        'screenshots',
        'storyline',
        'summary',
        'slug',
        'collection'
      ])
      .where(`id = ${igdbId}`)
      .request(`${baseUrl}/games`);
    const [genres, releaseDate, { developer, publisher }, { cover, screenshots }, series] = await Promise.all([
      getGenres(data.genres),
      getReleaseDate(data.release_dates ? data.release_dates[0] : null),
      getInvolvedCompanies(data.involved_companies),
      getImages(data.cover, data.screenshots),
      getSeries(data.collection)
    ]);
    // TODO: Re-implement translation
    const { rating, storyline, summary, ...game } = data;
    return {
      ...game,
      cover,
      developer,
      genres,
      publisher,
      rating: Math.round(rating),
      releaseDate,
      screenshots,
      series,
      summary: storyline || summary
    };
  } catch (error) {
    if (error.response) {
      throw new Error(`Server error: Searching for ${igdbId}, got "${error.response.statusText}"`);
    } else {
      throw new Error(`Server error: Searching for ${igdbId}, got "${error.message}"`);
    }
  }
}

export async function searchSteamGame(steamId: number) {
  logger.info('igdbWrapper', `Connecting to IGDB API to look for Steam game with id "${steamId}".`);
  const {
    data: [{ game }]
  } = await apicalypse(options)
    .fields(['game'])
    .where('category = 1')
    .where(`uid = "${steamId}"`)
    .request(`${baseUrl}/external_games`);
  return getGameById(game);
}
