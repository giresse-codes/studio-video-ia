import React from 'react';
import {interpolate} from 'remotion';
import {atelierExtras} from '../../../theme';
import {FONTS} from '../../../theme/fonts';
import {Duvet, EXTRA, StageSvg, Title, useScene} from '../atelier';

// 1. Hook : téléphone sous la couette, « Zzz », thermomètre qui monte, « DANS TON LIT ? ».
export const Scene1Hook: React.FC = () => {
	const {startMs, endMs, springAt, word, atFraction, nowMs, progress} = useScene();
	const bed = springAt(startMs, 16);
	const zzz = springAt(atFraction(0.2));
	const heat = progress(atFraction(0.15), endMs);
	const glow = 0.5 + 0.5 * Math.sin(nowMs / 180);
	return (
		<>
			<StageSvg>
				<g opacity={bed} transform={`translate(0 ${(1 - bed) * 40})`}>
					{/* Tête de lit et oreiller. */}
					<rect x={90} y={250} width={560} height={150} rx={50} fill={EXTRA.wood} filter="url(#soft)" />
					<rect x={150} y={320} width={200} height={90} rx={45} fill={EXTRA.white} filter="url(#soft)" />
					{/* Lueur du téléphone sous la couette. */}
					<ellipse cx={470} cy={430} rx={110} ry={50} fill={atelierExtras.glass} opacity={0.25 + glow * 0.25} />
					<g transform="translate(370 360)">
						<Duvet w={600} h={250} />
					</g>
					<ellipse cx={480} cy={445} rx={90} ry={34} fill={atelierExtras.glass} opacity={0.2 + glow * 0.3} />
				</g>
				{/* Zzz qui montent. */}
				{[0, 1, 2].map((i) => {
					const cycle = ((nowMs - atFraction(0.2) + i * 500) % 1500) / 1500;
					return (
						<text
							key={i}
							x={200 + i * 46}
							y={340 - i * 45 - cycle * 25}
							fontFamily={FONTS.title}
							fontWeight={800}
							fontSize={52 + i * 14}
							fill={EXTRA.ink}
							opacity={zzz * interpolate(cycle, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3])}
						>
							Z
						</text>
					);
				})}
				{/* Thermomètre. */}
				<g transform="translate(760 150)" opacity={bed}>
					<rect x={-30} y={0} width={60} height={300} rx={30} fill={EXTRA.white} filter="url(#soft)" />
					<rect x={-14} y={20 + 250 * (1 - (0.2 + heat * 0.75))} width={28} height={250 * (0.2 + heat * 0.75) + 20} rx={14} fill={EXTRA.orange} />
					<circle cx={0} cy={320} r={48} fill={EXTRA.orange} stroke={EXTRA.white} strokeWidth={12} />
				</g>
			</StageSvg>
			<Title text="DANS TON LIT ?" atMs={word('lit', 0.45)} y={30} size={110} />
		</>
	);
};
