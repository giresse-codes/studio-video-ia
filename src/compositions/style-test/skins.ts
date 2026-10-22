import type React from 'react';
import {atelierExtras, schemaExtras, type ThemeId, THEMES} from '../../theme';

// Apparence de la forme animée pour chaque thème.
export type Skin = {
	page: (picked: number) => React.CSSProperties;
	cover: React.CSSProperties;
	coverText: string;
	pageText: string;
	indexColor: string;
	pickColor: string;
	cellFill: string;
	fillsCells: boolean;
	paperLines: string | null;
};

export const getSkin = (id: ThemeId): Skin => {
	const c = THEMES[id].colors;
	if (id === 'schema') {
		const border = `${schemaExtras.strokeWidth}px solid ${c.ink}`;
		return {
			page: () => ({background: c.background, border, borderRadius: 14, boxSizing: 'border-box'}),
			cover: {background: c.tertiary, border, borderRadius: 18, boxSizing: 'border-box'},
			coverText: c.ink,
			pageText: c.ink,
			indexColor: c.ink,
			pickColor: c.accent,
			cellFill: c.tertiary,
			fillsCells: true,
			paperLines: '#D9D9D9',
		};
	}
	if (id === 'atelier') {
		return {
			page: (picked) => ({
				background: picked > 0.5 ? 'rgba(124, 200, 240, 0.85)' : 'rgba(124, 200, 240, 0.45)',
				border: `4px solid rgba(255, 255, 255, 0.7)`,
				borderRadius: 36,
				boxSizing: 'border-box',
				boxShadow: atelierExtras.softShadow,
			}),
			cover: {
				background: `linear-gradient(160deg, ${atelierExtras.metal}, #9DA4AD)`,
				borderRadius: 44,
				boxShadow: atelierExtras.softShadow,
			},
			coverText: '#1A1A1A',
			pageText: '#1A1A1A',
			indexColor: '#1A1A1A',
			pickColor: '#1A1A1A',
			cellFill: 'transparent',
			fillsCells: false,
			paperLines: 'rgba(255, 255, 255, 0.35)',
		};
	}
	return {
		page: (picked) => ({
			background: c.surface,
			border: `4px solid ${picked > 0.5 ? c.accent : c.tertiary}`,
			borderRadius: 22,
			boxSizing: 'border-box',
		}),
		cover: {background: c.tertiary, borderRadius: 26},
		coverText: c.background,
		pageText: c.ink,
		indexColor: c.secondary,
		pickColor: c.accent,
		cellFill: 'transparent',
		fillsCells: false,
		paperLines: 'rgba(232, 238, 247, 0.08)',
	};
};
