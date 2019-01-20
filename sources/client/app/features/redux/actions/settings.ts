import { Action, ActionType } from './actionsTypes';

export function updateSettings(settings: any): Action {
  return {
    payload: {
      settings
    },
    type: ActionType.UPDATE_SETTINGS
  };
}

export function updateModulesConfig(modulesConfig: any): Action {
  return {
    payload: {
      modulesConfig
    },
    type: ActionType.UPDATE_MODULES_CONFIG
  };
}

export function setLocales(locales: any[]): Action {
  return {
    payload: {
      locales
    },
    type: ActionType.SET_LOCALES
  };
}

export function setLocale(locale: string): Action {
  return {
    payload: {
      locale
    },
    type: ActionType.SET_LOCALE
  };
}

export function setInternetConnection(internetConnection: boolean): Action {
  return {
    payload: {
      internetConnection
    },
    type: ActionType.SET_INTERNET_CONNECTION
  };
}
