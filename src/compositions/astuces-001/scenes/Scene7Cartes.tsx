import React from 'react';
import {interpolate} from 'remotion';
import {atelierExtras} from '../../../theme';
import {FONTS} from '../../../theme/fonts';
import {EXTRA, STAGE, useScene} from '../atelier';

// 7. Trois cartes 1, 2, 3, qui apparaissent une par une avec de gros chiffres.
const CARDS = [
	{n: '1', text: 'Surface dure', key: 'dur', fallback: 0.08},
	{n: '2', text: 'Sans coque', key: 'coque', fallback: 0.38},
	{n: '3', text: 'Sans jeu', key: 'jeu', fallback: 0.68},
];

export const Scene7Cartes: React.FC = () => {
	const {springAt, word} = useScene();
	return (
		<>
			{CARDS.map((card, i) => {
				const s = springAt(word(card.key, card.fallback) - 300, 18);
				return (
					<div
						key={card.n}
						style={{
							position: 'absolute',
							left: 0,
							top: 10 + i * 205,
							width: STAGE.width,
							height: 180,
							borderRadius: 40,
							background: EXTRA.white,
							boxShadow: atelierExtras.softShadow,
							display: 'flex',
							alignItems: 'center',
							gap: 40,
							paddingLeft: 30,
							boxSizing: 'border-box',
							opacity: s,
							transform: `translateX(${interpolate(s, [0, 1], [-80, 0])}px)`,
						}}
					>
						<div
							style={{
								width: 140,
								height: 140,
								borderRadius: 70,
								background: atelierExtras.glass,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontFamily: FONTS.title,
								fontWeight: FONTS.titleWeight,
								fontSize: 110,
								color: EXTRA.ink,
								transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`,
							}}
						>
							{card.n}
						</div>
						<div style={{fontFamily: FONTS.body, fontWeight: 800, fontSize: 68, color: EXTRA.ink}}>{card.text}</div>
					</div>
				);
			})}
		</>
	);
};
