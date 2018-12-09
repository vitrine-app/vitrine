import { css, StyleSheet } from 'aphrodite';
import { margin, rgba } from 'css-verbose';
import * as React from 'react';

export const SplitBar: React.StatelessComponent<{}> = () => <hr className={css(styles.hr)} />;

const styles: React.CSSProperties & any = StyleSheet.create({
  hr: {
    border: 'none',
    borderTop: `solid ${(1).px()} ${rgba(210, 210, 210, 0.15)}`,
    margin: margin(30, 0)
  }
});
