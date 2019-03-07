import { css, StyleSheet } from 'aphrodite';
import { padding } from 'css-verbose';
import * as React from 'react';

interface Props {
  formatMessage: (context: { id: string }) => string;
  genres: string[];
}

export const GenresList: React.StatelessComponent<Props> = ({ formatMessage, genres }) => (
  <ul className={css(styles.genresList)}>
    {genres.map((genre: string, index: number) => (
      <li className={css(styles.gameGenre)} key={index}>
        {formatMessage({ id: `genresNames.${genre}` })}
      </li>
    ))}
  </ul>
);

const styles = StyleSheet.create({
  gameGenre: {
    padding: padding(4, 0)
  },
  genresList: {
    listStyleType: 'none',
    padding: padding(0, 0, 0, 7)
  }
});
