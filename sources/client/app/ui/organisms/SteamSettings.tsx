import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Form } from 'semantic-ui-react';

import { ErrorMessage } from '../atoms';
import { PathOption, ToggleOption } from '../molecules';

interface Props {
  error: boolean;
  formatMessage: (context: { id: string }) => string;
  path: string;
  pathButtonClick: () => void;
  searchCloud: boolean;
  searchCloudCheckbox: () => void;
}

export const SteamSettings: React.StatelessComponent<Props> = ({
  error,
  formatMessage,
  path,
  pathButtonClick,
  searchCloud,
  searchCloudCheckbox
}: Props) => (
  <React.Fragment>
    <Form.Field error={error}>
      <PathOption buttonClick={pathButtonClick} name={formatMessage({ id: 'settings.steamPath' })} path={path} valueName={'steam'} />
      {error && (
        <ErrorMessage>
          <FormattedMessage id={'settings.pathError'} />
        </ErrorMessage>
      )}
    </Form.Field>
    <ToggleOption active={searchCloud} name={formatMessage({ id: 'settings.steamSearchCloud' })} toggle={searchCloudCheckbox} />
  </React.Fragment>
);
