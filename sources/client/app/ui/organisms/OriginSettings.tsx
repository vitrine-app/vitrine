import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Form } from 'semantic-ui-react';

import { ErrorMessage } from '../atoms';
import { PathOption } from '../molecules';

interface Props {
  error: boolean;
  formatMessage: (context: { id: string }) => string;
  path: string;
  pathButtonClick: () => void;
}

export const OriginSettings: React.StatelessComponent<Props> = ({ error, formatMessage, path, pathButtonClick }: Props) => (
  <React.Fragment>
    <Form.Field error={error}>
      <PathOption buttonClick={pathButtonClick} name={formatMessage({ id: 'settings.origin.gamesPath' })} path={path} valueName={'origin'} />
      {error && (
        <ErrorMessage>
          <FormattedMessage id={'settings.pathError'} />
        </ErrorMessage>
      )}
    </Form.Field>
  </React.Fragment>
);
