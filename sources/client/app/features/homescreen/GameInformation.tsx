import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { css, StyleSheet } from 'aphrodite';
import { margin } from 'css-verbose';
import * as React from 'react';

interface Props {
  icon: FontAwesomeIcon.IconDefinition;
  title: string;
  value: string;
}

export const GameInformation: React.StatelessComponent<Props> = ({ icon, title, value }: Props) => (
  <div className={css(styles.wrapper)}>
    <div className={css(styles.iconSection)}>
      <FontAwesomeIcon icon={icon} size={'lg'} />
    </div>
    <div className={css(styles.titleSection)}>{title}</div>
    <div className={css(styles.valueSection)}>{value}</div>
  </div>
);

const styles: React.CSSProperties & any = StyleSheet.create({
  iconSection: {
    flex: 0.5
  },
  titleSection: {
    flex: 2.5,
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  valueSection: {
    flex: 7
  },
  wrapper: {
    display: 'flex',
    margin: margin(12, 0)
  }
});
