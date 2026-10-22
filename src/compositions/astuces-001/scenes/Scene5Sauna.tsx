import React from 'react';
import {interpolate} from 'remotion';
import {atelierExtras} from '../../../theme';
import {Duvet, EXTRA, Label, Phone, StageSvg, useScene} from '../atelier';

// 5. Gag : téléphone sous la couette, serviette sur la tête, bulles de vapeur, « sauna (non demandé) ».
export const Scene5Sauna: React.FC = () => {
	const {startMs, springAt, atFraction, nowMs, word} = useScene();
	const enter = springAt(startMs, 16);
	const towel = springAt(atFraction(0.15), 20);
	const steam = springAt(atFraction(0.3));
	return (
		<>
			<StageSvg>
				<g opacity={enter} transform={`translate(0 ${(1 - enter) * 40})`}>
					{/* Téléphone qui dépasse de la couette, joues rouges. */}
					<g transform="translate(435 330)">
						<Phone w={200} h={360}>
							<ellipse cx={-38} cy={-60} rx={14} ry={18} fill={EXTRA.white} />
							<ellipse cx={38} cy={-60} rx={14} ry={18} fill={EXTRA.white} />
							<ellipse cx={-62} cy={-18} rx={22} ry={12} fill={EXTRA.orange} opacity={0.8} />
							<ellipse cx={62} cy={-18} rx={22} ry={12} fill={EXTRA.orange} opacity={0.8} />
						</Phone>
						{/* Serviette nouée sur la tête. */}
						<g transform={`translate(0 ${(1 - towel) * -200})`} opacity={towel}>
							<path d="M -112 -140 Q -120 -250 0 -250 Q 120 -250 112 -140 Z" fill={EXTRA.white} filter="url(#soft)" />
							<path d="M -100 -170 H 100 M -104 -200 H 104" stroke={atelierExtras.glass} strokeWidth={12} />
							<circle cx={96} cy={-226} r={34} fill={EXTRA.white} />
						</g>
					</g>
					<g transform="translate(435 400)">
						<Duvet w={720} h={240} />
					</g>
					{/* Bulles de vapeur. */}
					{[0, 1, 2, 3, 4].map((i) => {
						const cycle = ((nowMs + i * 380) % 1900) / 1900;
						const x = 435 + (i - 2) * 120 + Math.sin(cycle * 6 + i) * 18;
						return (
							<circle
								key={i}
								cx={x}
								cy={330 - cycle * 300}
								r={18 + cycle * 26}
								fill={EXTRA.white}
								opacity={steam * interpolate(cycle, [0, 0.2, 0.8, 1], [0, 0.85, 0.6, 0])}
							/>
						);
					})}
				</g>
			</StageSvg>
			<Label text="sauna (non demandé)" atMs={word('sauna', 0.4)} x={160} y={-20} />
		</>
	);
};
