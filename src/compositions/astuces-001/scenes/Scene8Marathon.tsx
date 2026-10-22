import React from 'react';
import {interpolate} from 'remotion';
import {FONTS} from '../../../theme/fonts';
import {Charger, EXTRA, Phone, StageSvg, useScene} from '../atelier';

// 8. Gag : téléphone en dossard de marathon, sandwich à la main, qui court en charge.
export const Scene8Marathon: React.FC = () => {
	const {startMs, springAt, atFraction, nowMs} = useScene();
	const enter = springAt(startMs, 22);
	const bib = springAt(atFraction(0.2));
	const sandwich = springAt(atFraction(0.4));
	const run = nowMs / 150;
	const legA = Math.sin(run) * 35;
	const bob = Math.abs(Math.sin(run)) * -12;
	const x = interpolate(enter, [0, 1], [900, 480]);
	return (
		<StageSvg>
			{/* Sol qui défile. */}
			{[0, 1, 2, 3, 4].map((i) => {
				const dx = ((nowMs / 2 + i * 200) % 1000) - 100;
				return <rect key={i} x={870 - dx} y={600} width={90} height={12} rx={6} fill={EXTRA.ink} opacity={0.15} />;
			})}
			{/* Chargeur au loin et câble qui suit. */}
			<g transform="translate(70 520)">
				<Charger w={120} h={100} />
			</g>
			<path
				d={`M 70 570 C 200 ${640 + Math.sin(run) * 10}, ${x - 180} ${610 - Math.sin(run) * 10}, ${x} ${470 + bob}`}
				stroke={EXTRA.ink}
				strokeWidth={14}
				fill="none"
				strokeLinecap="round"
			/>
			<g transform={`translate(${x} ${300 + bob}) rotate(8)`}>
				{/* Jambes. */}
				<g stroke={EXTRA.ink} strokeWidth={16} strokeLinecap="round">
					<line x1={-30} y1={160} x2={-30 + Math.sin((legA * Math.PI) / 180) * 120} y2={160 + Math.cos((legA * Math.PI) / 180) * 120} />
					<line x1={30} y1={160} x2={30 - Math.sin((legA * Math.PI) / 180) * 120} y2={160 + Math.cos((legA * Math.PI) / 180) * 120} />
				</g>
				{/* Bras, dont un qui tient le sandwich. */}
				<g stroke={EXTRA.ink} strokeWidth={14} strokeLinecap="round">
					<line x1={-90} y1={10} x2={-150} y2={60 + legA} />
					<line x1={90} y1={10} x2={160} y2={-30 - legA * 0.5} />
				</g>
				<Phone w={180} h={320}>
					{/* Dossard. */}
					<g opacity={bib} transform={`scale(${interpolate(bib, [0, 1], [0.6, 1])})`}>
						<rect x={-64} y={-20} width={128} height={110} rx={12} fill={EXTRA.white} />
						<circle cx={-48} cy={-4} r={6} fill={EXTRA.ink} />
						<circle cx={48} cy={-4} r={6} fill={EXTRA.ink} />
						<text x={0} y={70} textAnchor="middle" fontFamily={FONTS.title} fontWeight={800} fontSize={64} fill={EXTRA.ink}>
							42
						</text>
					</g>
					<ellipse cx={-36} cy={-90} rx={12} ry={15} fill={EXTRA.white} />
					<ellipse cx={36} cy={-90} rx={12} ry={15} fill={EXTRA.white} />
				</Phone>
				{/* Sandwich. */}
				<g transform={`translate(170 ${-40 - legA * 0.5}) scale(${sandwich})`}>
					<path d="M -50 0 L 50 0 L 0 -60 Z" fill="#E9C38B" stroke="#C99A5B" strokeWidth={6} strokeLinejoin="round" />
					<path d="M -46 4 Q -20 18 0 6 Q 22 18 46 4" stroke="#5DBB63" strokeWidth={10} fill="none" strokeLinecap="round" />
					<path d="M -50 14 L 50 14 L 0 70 Z" fill="#E9C38B" stroke="#C99A5B" strokeWidth={6} strokeLinejoin="round" />
				</g>
			</g>
		</StageSvg>
	);
};
