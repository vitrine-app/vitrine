import * as React from 'react';

interface Props {
	hovered: boolean;
}

export const MinimizeSvg: React.StatelessComponent<Props> = ({ hovered }: Props) => (
	<svg
		width={12}
		height={12}
		viewBox={'0 0 12 12'}
	>
		<rect
			width={10}
			height={1}
			x={1}
			y={6}
			fill={(hovered) ? ('#A6A29F') : ('#676360')}
		/>
	</svg>
);
