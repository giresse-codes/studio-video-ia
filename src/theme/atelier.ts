import type {Theme} from './types';

// Style 2 « Atelier » (pseudo-3D chaud)
export const atelier: Theme = {
	id: 'atelier',
	name: 'Atelier',
	usage: 'Expliquer comment un objet fonctionne.',
	colors: {
		background: '#D8B7A4',
		ink: '#1A1A1A',
		accent: '#7CC8F0',
		secondary: '#BFC5CC',
		tertiary: '#B8A9D6',
		surface: '#B8A9D6',
	},
};

export const atelierExtras = {
	wall: '#D8B7A4',
	floor: '#B8A9D6',
	glass: '#7CC8F0',
	metal: '#BFC5CC',
	labelBackground: '#1A1A1A',
	labelText: '#8EE3FF',
	softShadow: '0 30px 60px rgba(60, 30, 20, 0.25)',
} as const;
