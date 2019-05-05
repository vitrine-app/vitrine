import { css, StyleSheet } from 'aphrodite';
import { border, rgba } from 'css-verbose';
import * as React from 'react';

interface Props {
  formatMessage: (context: { id: string }) => string;
  genres: string[];
}

export const GenresList: React.StatelessComponent<Props> = ({ formatMessage, genres }: Props) => (
  <div className={css(styles.genresList)}>
    {genres.map((genre: string, index: number) => (
      <span className={css(styles.genre)} key={index}>
        {formatMessage({ id: `genresNames.${genre}` })}
      </span>
    ))}
  </div>
);

const styles = StyleSheet.create({
  genre: {
    backgroundColor: rgba(249, 241, 237, 0.07),
    border: border(1, 'solid', rgba(255, 255, 255, 0.37)),
    borderRadius: 4,
    display: 'inline-block',
    margin: 3,
    opacity: 0.8,
    padding: 5
  },
  genresList: {
    paddingTop: 10
  }
});
