import { css, StyleSheet } from 'aphrodite';
import { rgba } from 'css-verbose';
import { remote } from 'electron';
import * as React from 'react';
import { toast } from 'react-toastify';
import { Middleware } from 'redux';

import { fontName } from 'less-vars-loader?camelCase&resolveVariables!../resources/less/theme/globals/site.variables';

function openDialog(options: any): string {
  const dialogRet: string[] = remote.dialog.showOpenDialog(options);
  if (!dialogRet || !dialogRet.length)
    return null;
  return dialogRet[0];
}

export function formatTimePlayed(timePlayed: number, formatMessage: (messageDescriptor: any, values?: any) => string): string {
  const hours: number = Math.floor(timePlayed / 3600);
  const minutes: number = Math.floor((timePlayed - (hours * 3600)) / 60);
  const seconds: number = timePlayed - (hours * 3600) - (minutes * 60);

  if (hours && minutes) {
    const hoursStr: string = formatMessage({ id: (hours !== 1) ? ('time.hoursPlur') : ('time.hoursSing') });
    const minutesStr: string = formatMessage({ id: (minutes) ? ((minutes !== 1) ? ('time.minutesPlur') : ('time.minutesSing')) : ('') });
    return `${hours}  ${hoursStr}${((minutesStr) ? (' ' + minutes + ' ' + minutesStr) : (''))}`;
  }
  else if (hours) {
    const hoursStr: string = formatMessage({ id: (hours !== 1) ? ('time.hoursPlur') : ('time.hoursSing') });
    return `${hours} ${hoursStr}`;
  }
  else if (minutes) {
    const minutesStr: string = formatMessage({ id: (minutes !== 1) ? ('time.minutesPlur') : ('time.minutesSing') });
    return `${minutes} ${minutesStr}`;
  }
  else if (seconds) {
    const secondsStr: string = formatMessage({ id: (seconds !== 1) ? ('time.secondsPlur') : ('time.secondsSing') });
    return `${timePlayed} ${secondsStr}`;
  }
  else
    return '';
}

export function openDirectory(): string {
  return openDialog({
    properties: [ 'openDirectory' ]
  });
}

export function openExecutableDialog(formatMessage: (messageDescriptor: any, values?: any) => string): string {
  return openDialog({
    properties: [ 'openFile' ],
    filters: [
      {
        name: formatMessage({ id: 'executables' }),
        extensions: [ 'exe' ]
      },
      {
        name: formatMessage({ id: 'allFiles' }),
        extensions: [ '*' ]
      }
    ]
  });
}

export function openImageDialog(formatMessage: (messageDescriptor: any, values?: any) => string): string {
  return openDialog({
    properties: [ 'openFile' ],
    filters: [
      {
        name: formatMessage({ id: 'images' }),
        extensions: [ 'jpg', 'jpeg', 'png', 'gif', 'bmp' ]
      }
    ]
  });
}

export function urlify(imgPath: string): string {
  return (imgPath) ? ('url(' + imgPath.replace(/\\/g, '\\\\') + ')') : ('');
}

export function notify(content: string, minor?: boolean, noAutoClose?: boolean) {
  const toastStyle: React.CSSProperties & any = StyleSheet.create({
    notification: {
      background: (!minor) ? rgba(216, 147, 98, 0.85) : (rgba(90, 85, 81, 0.60)),
      fontFamily: fontName.replace(/'/g, '')
    }
  });

  toast(<span dangerouslySetInnerHTML={{ __html: content }}/>, {
    type: 'default',
    position: 'bottom-right',
    className: css(toastStyle.notification),
    hideProgressBar: true,
    autoClose: (noAutoClose) ? (false) : ((!minor) ? (5000) : (3500))
  });
}

export const reduxLog: Middleware = (store: any) => (next: any) => (action: any): any => {
  console.log('Dispatching: ', action);
  const result = next(action);
  console.log('New state: ', store.getState(), '\n---------------');
  return result;
};
