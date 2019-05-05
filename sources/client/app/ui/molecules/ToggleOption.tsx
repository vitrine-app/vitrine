import { css, StyleSheet } from 'aphrodite';
import { padding, rgba } from 'css-verbose';
import * as React from 'react';
import { Checkbox } from 'semantic-ui-react';

interface Props {
  active: boolean;
  description?: string;
  name: string;
  toggle: () => void;
}

export const ToggleOption: React.StatelessComponent<Props> = ({ active, description, name, toggle }: Props) => (
  <div className={css(styles.wrapper)}>
    <div className={css(styles.toggleArea)} onClick={toggle}>
      <span className={css(styles.optionName)}>{name}</span>
      <Checkbox className={css(styles.optionToggle)} checked={active} toggle={true} />
    </div>
    {description && <div className={css(styles.optionDescription)}>{description}</div>}
  </div>
);

const styles: React.CSSProperties & any = StyleSheet.create({
  optionDescription: {
    color: rgba(255, 255, 255, 0.35),
    fontSize: 13,
    paddingTop: 12
  },
  optionName: {
    color: rgba(255, 255, 255, 0.7),
    cursor: 'pointer',
    fontWeight: 600
  },
  optionToggle: {
    marginLeft: 'auto'
  },
  toggleArea: {
    display: 'flex'
  },
  wrapper: {
    borderBottom: `1px solid ${rgba(255, 255, 255, 0.06)}`,
    padding: padding(16, 0),
    width: (98).percents()
  }
});
