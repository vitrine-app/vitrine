import { css, StyleSheet } from 'aphrodite';
import { padding, rgba } from 'css-verbose';
import * as React from 'react';

interface Props {
  children: React.ReactNode;
  isFlex?: boolean;
  leftSide?: boolean;
  rightSide?: boolean;
}

export const GameInfosPanel: React.StatelessComponent<Props> = ({ children, isFlex, leftSide, rightSide }) => (
  <div
    className={css(styles.panel)}
    style={{
      display: isFlex ? 'flex' : 'block',
      marginLeft: rightSide ? 5 : 0,
      marginRight: leftSide ? 5 : 0
    }}
  >
    {children}
  </div>
);

export const GameInfosBreaker = () => <div className={css(styles.breaker)} />;

const styles = StyleSheet.create({
  breaker: {
    marginTop: 10
  },
  panel: {
    backgroundColor: rgba(0, 0, 0, 0.5),
    borderRadius: 3,
    color: rgba(230, 228, 227, 0.85),
    fontSize: (1.2).em(),
    padding: padding(13, 24)
  }
});
