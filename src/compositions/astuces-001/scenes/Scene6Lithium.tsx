import React from 'react';
import {atelierExtras} from '../../../theme';
import {FONTS} from '../../../theme/fonts';
import {EXTRA, Label, StageSvg, useScene} from '../atelier';

// 6. Batterie au lithium qui perd de la capacité : le pourcentage baisse.
const FROM = 100;
const TO = 80;

export const Scene6Lithium: React.FC = () => {
	const {startMs, springAt, progress, atFraction, word} = useScene();
	const enter = springAt(startMs, 16);
	const wear = progress(atFraction(0.25), atFraction(0.85));
	const capacity = FROM - (FROM - TO) * wear;
	const inner = 480;
	const usable = (inner * capacity) / 100;
	return (
		<>
			<StageSvg>
				<defs>
					<pattern id="worn" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
						<rect width="28" height="28" fill="#D7CFC9" />
						<rect width="12" height="28" fill={EXTRA.orange} opacity={0.55} />
					</pattern>
				</defs>
				<g opacity={enter} transform={`translate(0 ${(1 - enter) * 40})`}>
					<g filter="url(#soft)">
						<rect x={175} y={160} width={520} height={260} rx={50} fill={atelierExtras.metal} />
						<rect x={695} y={240} width={40} height={100} rx={16} fill={atelierExtras.metal} />
					</g>
					<rect x={195} y={180} width={inner} height={220} rx={34} fill="url(#worn)" />
					<rect x={195} y={180} width={usable} height={220} rx={34} fill={atelierExtras.glass} />
					<text
						x={435}
						y={322}
						textAnchor="middle"
						fontFamily={FONTS.title}
						fontWeight={800}
						fontSize={120}
						fill={EXTRA.ink}
					>
						{`${Math.round(capacity)} %`}
					</text>
				</g>
			</StageSvg>
			<Label text="lithium" atMs={word('lithium', 0.15)} x={330} y={470} size={60} />
		</>
	);
};
