import { css, StyleSheet } from 'aphrodite';
import * as React from 'react';

interface Props {
  children: React.ReactNode;
}

export const ErrorMessage: React.StatelessComponent<Props> = ({ children }: Props) => <span className={css(styles.modulesError)}>{children}</span>;

const styles: React.CSSProperties & any = StyleSheet.create({
  modulesError: {
    color: '#A94442',
    fontWeight: 600,
    marginTop: 5
  }
});
