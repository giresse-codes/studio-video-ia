import React from 'react';
import {interpolate} from 'remotion';
import {atelierExtras} from '../../../theme';
import {EXTRA, Label, StageSvg, useScene} from '../atelier';

// 3. Gag : le chargeur avec un casque de chantier, des gouttes de sueur et un badge « heures sup ».
export const Scene3Chargeur: React.FC = () => {
	const {startMs, springAt, atFraction, nowMs} = useScene();
	const enter = springAt(startMs, 16);
	const hat = springAt(atFraction(0.15), 20);
	const sweat = springAt(atFraction(0.35));
	const sway = Math.sin(nowMs / 260) * 2.5;
	return (
		<>
			<StageSvg>
				<g opacity={enter} transform={`translate(435 ${330 + (1 - enter) * 40}) rotate(${sway})`}>
					{/* Broches. */}
					<rect x={-90} y={-170} width={34} height={70} rx={10} fill="#8F969E" />
					<rect x={56} y={-170} width={34} height={70} rx={10} fill="#8F969E" />
					{/* Corps du chargeur, avec un visage fatigué. */}
					<rect x={-170} y={-120} width={340} height={300} rx={70} fill={atelierExtras.metal} filter="url(#soft)" />
					<ellipse cx={-55} cy={10} rx={18} ry={14} fill={EXTRA.ink} />
					<ellipse cx={55} cy={10} rx={18} ry={14} fill={EXTRA.ink} />
					<path d="M -85 -22 L -30 -10 M 85 -22 L 30 -10" stroke={EXTRA.ink} strokeWidth={10} strokeLinecap="round" />
					<path d="M -45 85 Q -22 65 0 85 Q 22 105 45 85" stroke={EXTRA.ink} strokeWidth={10} strokeLinecap="round" fill="none" />
					{/* Casque de chantier. */}
					<g transform={`translate(0 ${(1 - hat) * -260})`} opacity={hat}>
						<path d="M -150 -120 Q -150 -250 0 -250 Q 150 -250 150 -120 Z" fill={EXTRA.gold} />
						<rect x={-190} y={-135} width={380} height={34} rx={17} fill={EXTRA.gold} />
						<rect x={-18} y={-250} width={36} height={120} rx={14} fill="#E09A1E" />
					</g>
					{/* Gouttes de sueur. */}
					{[-200, 195, -175].map((x, i) => {
						const cycle = ((nowMs + i * 420) % 1200) / 1200;
						return (
							<path
								key={x}
								d="M 0 -22 Q 16 0 0 14 Q -16 0 0 -22 Z"
								transform={`translate(${x} ${-60 + i * 50 + cycle * 70}) scale(1.6)`}
								fill={atelierExtras.glass}
								opacity={sweat * interpolate(cycle, [0, 0.2, 0.8, 1], [0, 1, 1, 0])}
							/>
						);
					})}
				</g>
			</StageSvg>
			<Label text="heures sup" atMs={atFraction(0.5)} x={290} y={540} size={56} />
		</>
	);
};
