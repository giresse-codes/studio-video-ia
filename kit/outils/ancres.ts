// Ancres : chaque événement visuel ou sonore est lié à un mot du script.
//   @mot        première occurrence du mot dans la scène (accents, ponctuation et élision l' d' qu' ignorés)
//   @mot#2      deuxième occurrence dans la scène
//   @chauff*    premier mot qui commence par « chauff »
//   @mot+0.1    décalage en secondes (ici 100 ms après le mot ; -0.1 pour avant)
//   @0          tout début de la vidéo
// L'écart toléré entre l'événement et l'heure du mot est SYNCHRO.ecartMaxSec.

export type MotHoraire = {text: string; start: number; end: number};

export type Ancre = {brute: string; mot: string; prefixe: boolean; rang: number; decalage: number; zero: boolean};

export type AncreResolue = Ancre & {
	// Heure du mot (s, depuis le début de la vidéo) et heure de l'événement.
	motSec: number;
	sec: number;
	motTrouve: string;
};

// Minuscules, sans accents ni ponctuation, sans élision : « l'URL. » → « url », « Étape » → « etape ».
export const normaliser = (s: string) =>
	s
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/^(?:l|d|j|m|n|s|t|c|qu|jusqu|lorsqu|puisqu)['’]/, '')
		.replace(/[^a-z0-9]/g, '');

const MOTIF = /^@([^#+\-\s]+?)(\*)?(?:#(\d+))?([+-]\d+(?:\.\d+)?)?$/;

export const lireAncre = (brute: string): Ancre => {
	const m = MOTIF.exec(brute.trim());
	if (!m) {
		throw new Error(`Ancre illisible : « ${brute} » (attendu : @mot, @mot#2, @mot*, @mot+0.1)`);
	}
	const mot = normaliser(m[1]);
	return {brute: brute.trim(), mot, prefixe: Boolean(m[2]), rang: m[3] ? Number(m[3]) : 1, decalage: m[4] ? Number(m[4]) : 0, zero: mot === '0'};
};

// Résout une ancre parmi les mots qui commencent à partir de `depuisSec` (début de la scène).
export const resoudreAncre = (brute: string, mots: MotHoraire[], depuisSec = 0): AncreResolue => {
	const a = lireAncre(brute);
	if (a.zero) {
		return {...a, motSec: 0, sec: Math.max(0, a.decalage), motTrouve: '(début)'};
	}
	const candidats = mots.filter((w) => {
		const n = normaliser(w.text);
		return w.start >= depuisSec - 0.05 && (a.prefixe ? n.startsWith(a.mot) : n === a.mot);
	});
	const w = candidats[a.rang - 1];
	if (!w) {
		throw new Error(`Ancre ${brute} : mot « ${a.mot} »${a.rang > 1 ? ` n°${a.rang}` : ''} introuvable après ${depuisSec.toFixed(2)} s`);
	}
	return {...a, motSec: w.start, sec: Math.max(0, w.start + a.decalage), motTrouve: w.text};
};

// Ancres utilisées dans le code d'une scène : appels S.ancre('@…') et S.zoomMot('@…').
// Les commentaires (HTML, /* */, //) sont ignorés : un exemple commenté n'est pas une ancre.
export const sansCommentaires = (source: string) =>
	source
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

export const ancresDansCode = (source: string): string[] => {
	const trouvees = new Set<string>();
	for (const m of sansCommentaires(source).matchAll(/\.(?:ancre|zoomMot)\(\s*['"`](@[^'"`]+)['"`]/g)) {
		trouvees.add(m[1]);
	}
	return [...trouvees];
};
