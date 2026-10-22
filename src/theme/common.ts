// Règles communes de STYLE.md
export const VIDEO = {
	width: 1080,
	height: 1920,
	fps: 30,
} as const;

// Zone sûre du texte, en pixels.
export const SAFE_ZONE = {
	left: 80,
	right: 130,
	bottom: 380,
	top: 160,
} as const;

export const CAPTIONS = {
	fontSize: 56,
	activeColor: '#FFD23F',
	inactiveColor: '#FFFFFF',
	strokeColor: '#000000',
	strokeWidth: 6,
} as const;

// Durée de la phrase à retenir, en secondes.
export const OUTRO_SECONDS = 3;

// Ressort doux, sans rebond sec.
export const SOFT_SPRING = {
	damping: 200,
	mass: 0.8,
} as const;

// Hauteur réservée aux sous-titres en bas de la zone sûre (deux lignes).
export const CAPTION_BAND = 180;

// Avatar : dans la zone sûre, juste au-dessus des sous-titres, contre le bord droit (ou gauche).
export const AVATAR_LAYOUT = {
	height: 560,
	width: Math.round((560 * 400) / 600),
	right: SAFE_ZONE.right,
	left: SAFE_ZONE.left,
	bottom: SAFE_ZONE.bottom + CAPTION_BAND,
} as const;
