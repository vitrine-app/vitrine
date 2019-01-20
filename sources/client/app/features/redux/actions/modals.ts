import { Action, ActionType } from './actionsTypes';

export function openGameAddModal(): Action {
  return {
    payload: {
      GameAddModalVisible: true
    },
    type: ActionType.OPEN_GAME_ADD_MODAL
  };
}

export function closeGameAddModal(): Action {
  return {
    payload: {
      GameAddModalVisible: false
    },
    type: ActionType.CLOSE_GAME_ADD_MODAL
  };
}

export function openIgdbResearchModal(): Action {
  return {
    payload: {
      igdbResearchModalVisible: true
    },
    type: ActionType.OPEN_IGDB_RESEARCH_MODAL
  };
}

export function closeIgdbResearchModal(): Action {
  return {
    payload: {
      igdbResearchModalVisible: false
    },
    type: ActionType.CLOSE_IGDB_RESEARCH_MODAL
  };
}

export function openTimePlayedEditionModal(): Action {
  return {
    payload: {
      timePlayedEditionModalVisible: true
    },
    type: ActionType.OPEN_TIME_PLAYED_EDITION_MODAL
  };
}

export function closeTimePlayedEditionModal(): Action {
  return {
    payload: {
      timePlayedEditionModalVisible: false
    },
    type: ActionType.CLOSE_TIME_PLAYED_EDITION_MODAL
  };
}

export function openPotentialGamesAddModal(): Action {
  return {
    payload: {
      potentialGamesAddModalVisible: true
    },
    type: ActionType.OPEN_POTENTIAL_GAMES_ADD_MODAL
  };
}

export function closePotentialGamesAddModal(): Action {
  return {
    payload: {
      potentialGamesAddModalVisible: false
    },
    type: ActionType.CLOSE_POTENTIAL_GAMES_ADD_MODAL
  };
}

export function openSettingsModal(): Action {
  return {
    payload: {
      settingsModalVisible: true
    },
    type: ActionType.OPEN_SETTINGS_MODAL
  };
}

export function closeSettingsModal(): Action {
  return {
    payload: {
      settingsModalVisible: false
    },
    type: ActionType.CLOSE_SETTINGS_MODAL
  };
}
