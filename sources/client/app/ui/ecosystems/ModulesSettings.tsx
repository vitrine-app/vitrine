import * as React from 'react';
import { ModuleSettings } from '../organisms';

import { faFolderOpen } from '@fortawesome/fontawesome-free-solid';
import * as battleNetIcon from '../../../resources/images/battle_net_icon.png';
import * as emulatedIcon from '../../../resources/images/emulated_icon.png';
import * as originIcon from '../../../resources/images/origin_icon.png';
import * as steamIcon from '../../../resources/images/steam_icon.png';
import { SteamSettings } from '../organisms';

interface Props {
  battleNetEnabled: boolean;
  emulatedEnabled: boolean;
  formatMessage: (context: { id: string }) => string;
  moduleIconClick: (moduleName: string) => () => void;
  originEnabled: boolean;
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
  formatMessage,
  moduleIconClick,
  originEnabled,
  steamEnabled,
  steamError,
  steamPath,
  steamPathButtonClick,
  steamSearchCloud,
  steamSearchCloudCheckbox
}) => (
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
  </React.Fragment>
);
