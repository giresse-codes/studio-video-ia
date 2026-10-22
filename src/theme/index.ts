import {atelier} from './atelier';
import {ecranCode} from './ecran-code';
import {schema} from './schema';
import type {Theme, ThemeId} from './types';

export * from './common';
export * from './types';
export {atelier, atelierExtras} from './atelier';
export {ecranCode} from './ecran-code';
export {schema, schemaExtras} from './schema';

export const THEMES: Record<ThemeId, Theme> = {
	schema,
	atelier,
	'ecran-code': ecranCode,
};

export const THEME_IDS = Object.keys(THEMES) as ThemeId[];
