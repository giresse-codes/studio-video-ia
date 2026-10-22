import React from 'react';
import {interpolate} from 'remotion';
import {atelierExtras} from '../../../theme';
import {EXTRA, StageSvg, useScene} from '../atelier';

// 4. Téléphone posé sur une table : des vagues orange s'échappent dans l'air.
export const Scene4Table: React.FC = () => {
	const {startMs, springAt, atFraction, nowMs} = useScene();
	const enter = springAt(startMs, 16);
	const waves = springAt(atFraction(0.2));
	const wavesFrom = atFraction(0.2);
	return (
		<StageSvg>
			<g opacity={enter} transform={`translate(0 ${(1 - enter) * 40})`}>
				{/* Table. */}
				<g filter="url(#soft)">
					<polygon points="170,420 700,420 790,500 80,500" fill={EXTRA.wood} />
					<rect x={80} y={500} width={710} height={34} rx={10} fill={EXTRA.woodDark} />
					<rect x={130} y={530} width={36} height={110} rx={10} fill={EXTRA.woodDark} />
					<rect x={704} y={530} width={36} height={110} rx={10} fill={EXTRA.woodDark} />
				</g>
				{/* Téléphone à plat. */}
				<g transform="translate(435 455)">
					<rect x={-150} y={-30} width={300} height={56} rx={24} fill={atelierExtras.metal} />
					<rect x={-134} y={-30} width={268} height={30} rx={14} fill={atelierExtras.glass} opacity={0.8} />
				</g>
				{/* Vagues de chaleur. */}
				{[0, 1, 2, 3].map((i) => {
					const t = nowMs - wavesFrom + i * 450;
					const cycle = t < 0 ? 0 : (t % 1800) / 1800;
					const y = 400 - cycle * 330;
					const w = 120 + cycle * 160;
					return (
						<path
							key={i}
							d={`M ${435 - w} ${y} q ${w / 4} -34 ${w / 2} 0 t ${w / 2} 0 t ${w / 2} 0 t ${w / 2} 0`}
							stroke={EXTRA.orange}
							strokeWidth={16}
							strokeLinecap="round"
							fill="none"
							opacity={waves * interpolate(cycle, [0, 0.15, 0.7, 1], [0, 1, 0.8, 0])}
						/>
					);
				})}
			</g>
		</StageSvg>
	);
};
