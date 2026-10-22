export type ThemeId = 'schema' | 'atelier' | 'ecran-code';

export type Theme = {
	id: ThemeId;
	name: string;
	usage: string;
	colors: {
		background: string;
		ink: string;
		accent: string;
		secondary: string;
		tertiary: string;
		surface: string;
	};
};
