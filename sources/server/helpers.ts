import * as downloadFileCb from 'download-file';
import * as fs from 'fs-extra';
import { promise as glob } from 'glob-promise';
import * as path from 'path';

import { getEnvFolder, uuidV5 } from '@models/env';
import { logger } from './Logger';

function downloadFile(file: string, options: any): Promise<any> {
  return new Promise((resolve, reject) => {
    downloadFileCb(file, options, (error: Error) => {
      if (error)
        reject(error);
      else
        resolve(true);
    });
  });
}

function setTimeOut(ms: number): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

async function deleteOldImages(path: string, except: string) {
  const files: string[] = await glob(path);
  if (!files.length)
    return;
  files.filter((file: string) => file !== except.replace(/\\/g, '/')).forEach(async (file: string) => {
    await fs.remove(file);
  });
}

async function downloadImage(source: string, destination: string) {
  if (!source || (source.startsWith('file://') && !await fs.pathExists(source.substring(7)))) {
    logger.info('downloadImage', `Local source image (${source}) not found.`);
    return false;
  }
  if (source.startsWith('file://')) {
    source = source.substring(7);
    if (source === destination)
      return true;
    logger.info('downloadImage', `Copying local source image (${source}) to ${destination}.`);
    await fs.copy(source, destination);
    const fileGlob: string = destination.replace(/(\w+)\.(\w+)\.(\w+)/g, '$1.*.$3');
    await deleteOldImages(fileGlob, destination);
    return true;
  }
  else {
    logger.info('downloadImage', `Downloading distant source image (${source}) to ${destination}.`);
    const succeeded: boolean = await Promise.race([
      downloadFile(source, {
        directory: path.dirname(destination),
        filename: path.basename(destination)
      }),
      setTimeOut(10000)
    ]);
    return succeeded || false;
  }
}

export async function downloadGamePictures(gameDetails: any, { backgroundUrl, backgroundPath, coverUrl, coverPath }: any) {
  const backGroundStored: boolean = await downloadImage(backgroundUrl, backgroundPath);
  const coverStored: boolean = await downloadImage(coverUrl, coverPath);
  return {
    backgroundScreen: backGroundStored ? backgroundPath : gameDetails.backgroundScreen,
    cover: coverStored ? coverPath : gameDetails.cover
  };
}

export function isAlreadyStored(imageSourcePath: string, imageDestinationPath: string): boolean {
  if (!imageSourcePath)
    return false;
  return imageSourcePath === imageDestinationPath && imageSourcePath.startsWith('file://');
}

export function spatStr(str: string) {
  return str.replace(/ /g, '').replace(/([-:])/g, '|');
}

export function gameDirExists(name: string): boolean {
  const gameUuid: string = uuidV5(name);
  const gameDirectory: string = path.resolve(getEnvFolder('games'), gameUuid);
  const configFilePath: string = path.resolve(gameDirectory, 'config.json');
  return fs.pathExistsSync(configFilePath);
}
