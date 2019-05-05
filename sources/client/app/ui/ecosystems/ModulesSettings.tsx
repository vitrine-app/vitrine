import * as React from 'react';

import { EmulatedGamesSettings, ModuleSettings, OriginSettings, SteamSettings } from '../organisms';

import * as battleNetIcon from '../../../resources/images/battle_net_icon.png';
import * as emulatedIcon from '../../../resources/images/emulated_icon.png';
import * as originIcon from '../../../resources/images/origin_icon.png';
import * as steamIcon from '../../../resources/images/steam_icon.png';

interface Props {
  battleNetEnabled: boolean;
  emulatedEnabled: boolean;
  emulatedError: boolean;
  emulatedPath: string;
  emulatedPathButtonClick: () => void;
  formatMessage: (context: { id: string }) => string;
  moduleIconClick: (moduleName: string) => () => void;
  originEnabled: boolean;
  originError: boolean;
  originPath: string;
  originPathButtonClick: () => void;
  steamEnabled: boolean;
  steamError: boolean;
  steamPath: string;
  steamPathButtonClick: () => void;
  steamSearchCloud: boolean;
  steamSearchCloudCheckbox: () => void;
}

export const ModulesSettings: React.StatelessComponent<Props> = ({
  battleNetEnabled,
  emulatedEnabled,
  emulatedError,
  emulatedPath,
  emulatedPathButtonClick,
  formatMessage,
  moduleIconClick,
  originEnabled,
  originError,
  originPath,
  originPathButtonClick,
  steamEnabled,
  steamError,
  steamPath,
  steamPathButtonClick,
  steamSearchCloud,
  steamSearchCloudCheckbox
}: Props) => (
  <React.Fragment>
    <ModuleSettings color={'#141723'} enabled={steamEnabled} icon={steamIcon} name={'Steam'} toggleModule={moduleIconClick('steam')}>
      <SteamSettings
        error={steamError}
        formatMessage={formatMessage}
        path={steamPath}
        pathButtonClick={steamPathButtonClick}
        searchCloud={steamSearchCloud}
        searchCloudCheckbox={steamSearchCloudCheckbox}
      />
    </ModuleSettings>
    <ModuleSettings color={'#903b22'} enabled={originEnabled} icon={originIcon} name={'Origin'} toggleModule={moduleIconClick('origin')}>
      <OriginSettings error={originError} formatMessage={formatMessage} path={originPath} pathButtonClick={originPathButtonClick} />
    </ModuleSettings>
    <ModuleSettings
      color={'#2978b9'}
      enabled={battleNetEnabled}
      icon={battleNetIcon}
      name={'Battle.net'}
      toggleModule={moduleIconClick('battleNet')}
    />
    <ModuleSettings
      color={'#234a34'}
      enabled={emulatedEnabled}
      icon={emulatedIcon}
      name={formatMessage({ id: 'settings.emulatedGames' })}
      toggleModule={moduleIconClick('emulated')}
    >
      <EmulatedGamesSettings error={emulatedError} formatMessage={formatMessage} path={emulatedPath} pathButtonClick={emulatedPathButtonClick} />
    </ModuleSettings>
  </React.Fragment>
);
