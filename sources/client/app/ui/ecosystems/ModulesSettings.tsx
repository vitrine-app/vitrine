import * as React from 'react';
import { Grid } from 'semantic-ui-react';

import { GamesModule } from '../molecules';

import * as battleNetIcon from '../../../resources/images/battle_net_icon.png';
import * as emulatedIcon from '../../../resources/images/emulated_icon.png';
import * as originIcon from '../../../resources/images/origin_icon.png';
import * as steamIcon from '../../../resources/images/steam_icon.png';

interface Props {
  battleNetEnabled: boolean;
  emulatedEnabled: boolean;
  moduleIconClick: (moduleName: string) => (checked: boolean) => void;
  originEnabled: boolean;
  steamEnabled: boolean;
}

export const ModulesSettings: React.StatelessComponent<Props> = ({
  battleNetEnabled,
  emulatedEnabled,
  moduleIconClick,
  originEnabled,
  steamEnabled
}) => (
  <Grid>
    <Grid.Column width={4}>
      <GamesModule clicked={steamEnabled} iconFile={steamIcon} iconAlt={'Steam'} clickHandler={moduleIconClick('steam')} />
    </Grid.Column>
    <Grid.Column width={4}>
      <GamesModule clicked={originEnabled} iconFile={originIcon} iconAlt={'Origin'} clickHandler={moduleIconClick('origin')} />
    </Grid.Column>
    <Grid.Column width={4}>
      <GamesModule clicked={battleNetEnabled} iconFile={battleNetIcon} iconAlt={'Battle.net'} clickHandler={moduleIconClick('battleNet')} />
    </Grid.Column>
    <Grid.Column width={4}>
      <GamesModule clicked={emulatedEnabled} iconFile={emulatedIcon} iconAlt={'Origin'} clickHandler={moduleIconClick('emulated')} />
    </Grid.Column>
  </Grid>
);
