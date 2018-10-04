import * as React from 'react';

interface Props {
  hovered: boolean;
}

export const CloseSvg: React.StatelessComponent<Props> = ({ hovered }: Props) => (
  <svg
    width={12}
    height={12}
    viewBox={'0 0 12 12'}
  >
    <polygon
      points={'11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1'}
      fill={(hovered) ? ('#A6A29F') : ('#676360')}
      fillRule={'evenodd'}
    />
  </svg>
);
