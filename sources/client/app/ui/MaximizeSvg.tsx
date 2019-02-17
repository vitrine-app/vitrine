import * as React from 'react';

interface Props {
  hovered: boolean;
}

export const MaximizeSvg: React.StatelessComponent<Props> = ({ hovered }: Props) => (
  <svg width={12} height={12} viewBox={'0 0 12 12'}>
    <rect width={9} height={9} x={1.5} y={1.5} fill={'none'} stroke={hovered ? '#A6A29F' : '#676360'} />
  </svg>
);
