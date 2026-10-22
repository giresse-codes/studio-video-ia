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
