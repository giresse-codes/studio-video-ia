// Règles du studio, en chiffres. Lues par les outils (nouvelle-video, preparer, verifier) ;
// STYLE.md et CLAUDE.md les décrivent en clair : les garder alignés.

export type Chaine = 'astuces' | 'devsteach';

export const CHAINES: Record<Chaine, {nom: string; dureeSec: [number, number]; mots: [number, number]}> = {
	astuces: {nom: 'Astuces', dureeSec: [25, 35], mots: [65, 85]},
	devsteach: {nom: 'DevsTeach', dureeSec: [35, 50], mots: [90, 120]},
};

// Accélération maximale de la voix (atempo), seulement après avoir proposé de couper le texte.
export const ATEMPO_MAX = 1.1;

export const FORMAT = {largeur: 1080, hauteur: 1920, ips: 30} as const;

// La scène remplit le haut de l'image ; le bas (sous l'interface des applis) reste décoré.
export const SCENE_BAS = 1500;

// Zone sûre du texte (px depuis chaque bord).
export const ZONE_SURE = {gauche: 80, droite: 130, bas: 380, haut: 160} as const;

export const SOUS_TITRES = {
	taillePx: 56,
	motsParGroupe: 4,
	motActif: '#FFD23F',
	texte: '#FFFFFF',
	pastille: 'rgba(20, 20, 20, 0.82)',
} as const;

export const ETIQUETTE_MIN_PX = 56;

// Avatar : 1,6 fois sa taille d'origine (373 x 560 px), à cheval sur le bas de la scène.
export const AVATAR = {
	echelle: 1.6,
	largeur: Math.round(373 * 1.6),
	hauteur: Math.round(560 * 1.6),
	// Pieds sous le bord de la scène, corps un peu coupé par le bord de l'image.
	dessousScene: 300,
	horsCadre: 40,
} as const;

export const MOUVEMENT = {
	travelling: [1, 1.12] as [number, number],
	zoomMot: {echelle: 1.25, dureeSec: 0.25},
	// Chevauchement de deux scènes pendant une transition.
	transitionSec: 0.4,
} as const;

export const SYNCHRO = {
	// Écart maximal entre un événement et l'heure de son mot.
	ecartMaxSec: 0.15,
	// Premier son de la vidéo.
	premierSonSec: 0.2,
} as const;

// Bruitages : crête 18 dB sous la crête de la voix.
export const SON = {sousLaVoixDb: 18} as const;

// Moteur HyperFrames figé par vidéo : le même rendu dans six mois.
export const HYPERFRAMES_VERSION = '0.8.185';
