import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { css, StyleSheet } from 'aphrodite';
import { padding, rgba } from 'css-verbose';
import * as React from 'react';
import { Button, Input } from 'semantic-ui-react';

import { faFolderOpen } from '@fortawesome/fontawesome-free-solid';

interface Props {
  buttonClick: () => void;
  description?: string;
  name: string;
  path: string;
  valueName: string;
}

export const PathOption: React.StatelessComponent<Props> = ({ buttonClick, description, name, path, valueName }: Props) => (
  <div className={css(styles.wrapper)}>
    <span className={css(styles.optionName)} onClick={buttonClick}>
      {name}
    </span>
    <Input
      className={css(styles.optionInput)}
      label={
        <Button secondary={true} onClick={buttonClick}>
          <FontAwesomeIcon icon={faFolderOpen} />
        </Button>
      }
      labelPosition={'right'}
      name={valueName}
      size={'large'}
      placeholder={name}
      value={path}
      onClick={buttonClick}
      readOnly={true}
    />
    {description && <div className={css(styles.optionDescription)}>{description}</div>}
  </div>
);

const styles: React.CSSProperties & any = StyleSheet.create({
  optionDescription: {
    color: rgba(255, 255, 255, 0.35),
    fontSize: 13,
    paddingTop: 12
  },
  optionInput: {
    width: (100).percents()
  },
  optionName: {
    color: rgba(255, 255, 255, 0.7),
    cursor: 'pointer',
    display: 'block',
    fontWeight: 600,
    marginBottom: 12
  },
  wrapper: {
    borderBottom: `1px solid ${rgba(255, 255, 255, 0.06)}`,
    padding: padding(16, 0),
    width: (98).percents()
  }
});
