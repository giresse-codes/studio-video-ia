import React from 'react';
import {atelierExtras} from '../../../theme';
import {Arrow, ArrowHead, Charger, EXTRA, Label, StageSvg, useScene} from '../atelier';

// 2. Coupe : le courant entre par le câble, flèche dorée jusqu'à la batterie,
// trois flèches rouges s'échappent (câble, chargeur, batterie).
const LEAKS = [
	{d: 'M 270 560 Q 250 610 200 640', head: {x: 200, y: 640, angle: 150}},
	{d: 'M 110 440 Q 90 380 40 350', head: {x: 40, y: 350, angle: -145}},
	{d: 'M 560 330 Q 640 300 700 250', head: {x: 700, y: 250, angle: -35}},
];

export const Scene2Coupe: React.FC = () => {
	const {startMs, springAt, progress, word, atFraction} = useScene();
	const enter = springAt(startMs, 16);
	const current = progress(atFraction(0.1), atFraction(0.45));
	const leakMs = word('perd', 0.5);
	const heatMs = word('chaleur', 0.8);
	return (
		<>
			<StageSvg>
				<g opacity={enter} transform={`translate(0 ${(1 - enter) * 40})`}>
					{/* Téléphone en coupe. */}
					<g filter="url(#soft)">
						<rect x={330} y={60} width={300} height={520} rx={60} fill={atelierExtras.metal} />
						<rect x={350} y={80} width={260} height={480} rx={46} fill="#EDE7E2" />
					</g>
					<rect x={380} y={230} width={200} height={240} rx={30} fill={atelierExtras.glass} opacity={0.35 + current * 0.5} />
					<rect x={455} y={210} width={50} height={24} rx={8} fill={atelierExtras.glass} />
					<path d="M 480 300 v 60 M 450 330 h 60" stroke={EXTRA.white} strokeWidth={14} strokeLinecap="round" />
					{/* Chargeur et câble. */}
					<g transform="translate(110 500)">
						<Charger />
					</g>
					<path d="M 110 560 C 110 640 480 650 480 580" fill="none" stroke={EXTRA.ink} strokeWidth={16} strokeLinecap="round" />
					{/* Courant : flèche dorée. */}
					<Arrow d="M 110 560 C 110 640 480 650 480 580 L 480 380" color={EXTRA.gold} draw={current} width={14} length={900} />
					<ArrowHead x={480} y={372} angle={-90} color={EXTRA.gold} scale={current > 0.95 ? 1 : 0} />
					{/* Chaleur perdue : flèches rouges. */}
					{LEAKS.map((leak, i) => {
						const s = springAt(leakMs + i * 400, 16);
						return (
							<g key={leak.d} opacity={s}>
								<Arrow d={leak.d} color={EXTRA.red} draw={s} width={18} length={160} />
								<ArrowHead {...leak.head} color={EXTRA.red} scale={s * 0.9} />
							</g>
						);
					})}
				</g>
			</StageSvg>
			<Label text="chaleur perdue" atMs={heatMs} x={420} y={-10} />
		</>
	);
};
