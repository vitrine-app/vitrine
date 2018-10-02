import * as downloadFileCb from 'download-file';
import * as fs from 'fs-extra';
import * as glob from 'glob';
import * as path from 'path';

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

function deleteFiles(path: string, except?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    glob(path, (error: Error, files: string[]) => {
      if (error) {
        reject(error);
        return;
      }
      if (!files.length) {
        resolve();
        return;
      }
      files.forEachEnd(async (file: string, done: () => void) => {
        if (file !== except.replace(/\\/g, '/'))
          await fs.remove(file);
        done();
      }, () => {
        resolve();
      });
    });
  });
}

export async function downloadImage(src: string, dest: string) {
  if (!src || (src.startsWith('file://') && !await fs.pathExists(src.substring(7)))) {
    logger.info('downloadImage', `Local source image (${src}) not found.`);
    return false;
  }
  if (src.startsWith('file://')) {
    src = src.substring(7);
    if (src === dest)
      return true;
    try {
      logger.info('downloadImage', `Copying local source image (${src}) to ${dest}.`);
      await fs.copy(src, dest);
      const fileGlob: string = dest.replace(/(\w+)\.(\w+)\.(\w+)/g, '$1.*.$3');
      try {
        await deleteFiles(fileGlob, dest);
        return true;
      }
      catch (error) {
        return error;
      }
    }
    catch (error) {
      return error;
    }
  }
  else {
    try {
      logger.info('downloadImage', `Downloading distant source image (${src}) to ${dest}.`);
      const succeeded: boolean = await Promise.race([
        downloadFile(src, {
          directory: path.dirname(dest),
          filename: path.basename(dest)
        }),
        setTimeOut(10000)
      ]);
      return succeeded || false;
    }
    catch (error) {
      return error;
    }
  }
}

export function isAlreadyStored(imageSrcPath: string, imageDestPath: string): boolean {
  return imageSrcPath === imageDestPath && imageSrcPath.startsWith('file://');
}

export function spatStr(str: string) {
  return str.replace(/ /g, '').replace(/([-:])/g, '|');
}
