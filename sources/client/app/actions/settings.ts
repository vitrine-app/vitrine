import { Action, ActionType } from './actionsTypes';

export function updateSettings(settings: any): Action {
  return {
    type: ActionType.UPDATE_SETTINGS,
    payload: {
      settings
    }
  };
}

export function updateModulesConfig(modulesConfig: any): Action {
  return {
    type: ActionType.UPDATE_MODULES_CONFIG,
    payload: {
      modulesConfig
    }
  };
}

export function setInternetConnection(internetConnection: boolean): Action {
  return {
    type: ActionType.SET_INTERNET_CONNECTION,
    payload: {
      internetConnection
    }
  };
}
