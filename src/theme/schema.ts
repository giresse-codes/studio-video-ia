import type {Theme} from './types';

// Style 1 « Schéma » (fond clair)
export const schema: Theme = {
	id: 'schema',
	name: 'Schéma',
	usage: 'Démonstration par les chiffres, comparaisons, arnaques.',
	colors: {
		background: '#FFFFFF',
		ink: '#141414',
		accent: '#2EB82E',
		secondary: '#E5383B',
		tertiary: '#EBDDBB',
		surface: '#EBDDBB',
	},
};

export const schemaExtras = {
	strokeWidth: 10,
} as const;
