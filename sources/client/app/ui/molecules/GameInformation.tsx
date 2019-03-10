import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { css, StyleSheet } from 'aphrodite';
import { margin } from 'css-verbose';
import * as React from 'react';

import { SectionTitle } from '../atoms';

interface Props {
  icon: FontAwesomeIcon.IconDefinition;
  isSmall?: boolean;
  title: string;
  value: string;
}

export const GameInformation: React.StatelessComponent<Props> = ({ icon, isSmall, title, value }: Props) => (
  <div className={css(styles.wrapper)}>
    <div style={{ flex: isSmall ? 1.5 : 0.5 }}>
      <FontAwesomeIcon icon={icon} size={'lg'} />
    </div>
    <SectionTitle style={{ flex: isSmall ? 4.5 : 2.5 }}>{title}</SectionTitle>
    <div style={{ flex: isSmall ? 4 : 7 }}>{value}</div>
  </div>
);

const styles: React.CSSProperties & any = StyleSheet.create({
  wrapper: {
    display: 'flex',
    margin: margin(12, 0)
  }
});
