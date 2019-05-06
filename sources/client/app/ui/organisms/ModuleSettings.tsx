import { css, StyleSheet } from 'aphrodite';
import { margin, padding, rgba } from 'css-verbose';
import * as React from 'react';
import { Checkbox } from 'semantic-ui-react';

interface Props {
  children?: React.ReactNode;
  color: string;
  enabled: boolean;
  icon: string;
  name: string;
  toggleModule: () => void;
}

export const ModuleSettings: React.StatelessComponent<Props> = ({ children, color: backgroundColor, enabled, icon, name, toggleModule }: Props) => (
  <div className={css(styles.moduleArea)} style={{ backgroundColor }}>
    <div className={css(styles.moduleHeader)} onClick={toggleModule}>
      <img alt={name} className={css(styles.moduleIcon)} src={icon} />
      <span className={css(styles.moduleName)}>{name}</span>
      <Checkbox checked={enabled} className={css(styles.moduleToggle)} toggle={true} />
    </div>
    {children && enabled && <div className={css(styles.moduleContent)}>{children}</div>}
  </div>
);

const styles: React.CSSProperties & any = StyleSheet.create({
  moduleArea: {
    ':first-child': {
      margin: 0
    },
    borderRadius: 4,
    boxShadow: `0 0 2px 0 ${rgba(0, 0, 0, 0.45)}`,
    margin: margin(15, 0)
  },
  moduleContent: {
    backgroundColor: rgba(255, 255, 255, 0.04),
    border: `solid ${rgba(0, 0, 0, 0.5)} 1`,
    padding: padding(16, 20)
  },
  moduleHeader: {
    alignItems: 'center',
    cursor: 'pointer',
    display: 'flex',
    padding: padding(16, 20)
  },
  moduleIcon: {
    height: 35,
    opacity: 0.7,
    width: 35
  },
  moduleName: {
    color: rgba(255, 255, 255, 0.8),
    fontSize: 16,
    margin: margin(0, 15)
  },
  moduleToggle: {
    marginLeft: 'auto'
  }
});
