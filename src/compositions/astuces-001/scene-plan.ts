import type {ScriptSentence} from '../../lib/script';

// Chaque scène commence à la première phrase (après la scène précédente) contenant un de ses mots-clés.
// Partagé par la version Remotion et le générateur HyperFrames.
export const SCENE_KEYWORDS: string[][] = [
	[], // Scene1Hook
	['ce qui se passe', 'courant'], // Scene2Coupe
	['heures sup', 'transpire'], // Scene3Chargeur
	['table'], // Scene4Table
	['couette', 'sauna'], // Scene5Sauna
	['lithium', 'capacite'], // Scene6Lithium
	['trois gestes', 'surface dure'], // Scene7Cartes
	['match', 'marathon'], // Scene8Marathon
	['tu charges ou', 'commentaire'], // Scene9Question
];

const normalize = (s: string) =>
	s
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[’]/g, "'");

export const assignScenes = (sentences: ScriptSentence[]): number[] => {
	const starts = [0];
	for (let k = 1; k < SCENE_KEYWORDS.length; k++) {
		const from = starts[k - 1] + 1;
		const found = sentences.findIndex((s, i) => i >= from && SCENE_KEYWORDS[k].some((kw) => normalize(s.text).includes(kw)));
		// Mot-clé introuvable : on avance d'une phrase, sans dépasser la fin.
		starts.push(found === -1 ? Math.min(from, sentences.length - 1) : found);
	}
	return starts;
};
