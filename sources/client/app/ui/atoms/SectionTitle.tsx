import { css, StyleSheet } from 'aphrodite';
import * as React from 'react';

interface Props {
  children: React.ReactNode;
  style?: any;
}

export const SectionTitle: React.StatelessComponent<Props> = ({ children, style }) => (
  <span className={css(styles.title)} style={style || {}}>
    {children}
  </span>
);

const styles = StyleSheet.create({
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  }
});
