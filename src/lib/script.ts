import type {AvatarPose} from '../components/Avatar';

// Script d'une vidéo : texte lu par le narrateur, avec des balises entre crochets
// (« [choqué] », « [ton pédagogue] », « [pause] »…). Les balises ne sont jamais
// affichées ; celles qui décrivent une émotion choisissent la pose de l'avatar.

export type ScriptSentence = {
	// Texte affiché (sans balises).
	text: string;
	words: string[];
	// Balises d'émotion telles qu'écrites dans le script, sans crochets.
	emotion: string | null;
	pose: AvatarPose;
};

const normalize = (s: string) =>
	s
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '');

// Racine de mot (sans accents) → pose. Le premier motif trouvé dans la balise l'emporte.
const EMOTION_TO_POSE: [RegExp, AvatarPose][] = [
	[/choqu|outr|indign|scandal|horrif|effar|solenn|dramat|\bsec\b/, 'choque'],
	[/\bri(re|ant|eur|euse)|amus|hilar|moqu|blagu|esclaff/, 'rit'],
	[/curieu|intrigu|perplex|pensi|reflech|songeu|interrog|mysteri/, 'reflechit'],
	[/surpri|eton|stupef|inquiet|alarm/, 'surpris'],
	[/pedago|expli|didact|serieu|pose|clair|assur|compt/, 'explique'],
	[/montr|design|point/, 'montre'],
	[/content|joyeu|enthous|ravi|satisf|chaleureu|complic|souri|dynamiq|energ|enjou|taquin|malic/, 'content'],
	[/neutre|calme|normal/, 'neutre'],
];

export const emotionToPose = (emotion: string): AvatarPose | null => {
	const key = normalize(emotion);
	return EMOTION_TO_POSE.find(([pattern]) => pattern.test(key))?.[1] ?? null;
};

// Retire ce qui n'est pas lu : en-tête YAML, titres Markdown, commentaires, citations (notes).
const spokenText = (markdown: string) =>
	markdown
		.replace(/^---\n[\s\S]*?\n---\n/, '')
		.replace(/<!--[\s\S]*?-->/g, '')
		.split('\n')
		.filter((line) => !/^\s*(#|>)/.test(line))
		.join(' ');

const TAG = /\[([^\]]*)\]/g;

// Mots lus : la ponctuation isolée par l'espace française (« lit ? », « Une : ») reste collée au mot.
const toWords = (text: string) =>
	text.split(' ').reduce<string[]>((words, token) => {
		if (!/[\p{L}\p{N}]/u.test(token) && words.length > 0) {
			words[words.length - 1] += ` ${token}`;
		} else {
			words.push(token);
		}
		return words;
	}, []);

export const parseScript = (markdown: string): ScriptSentence[] => {
	const text = spokenText(markdown);
	// Coupe en phrases après . ! ? … (y compris suivis d'un guillemet fermant).
	const chunks = text.split(/(?<=[.!?…]["»”]?)\s+/);

	const sentences: ScriptSentence[] = [];
	let pose: AvatarPose = 'neutre';
	let pendingEmotion: string | null = null;
	// « [indigné, puis rire] » : une émotion par phrase, dans l'ordre.
	let queued: {emotion: string; pose: AvatarPose}[] = [];
	for (const chunk of chunks) {
		const tags = [...chunk.matchAll(TAG)].map((m) => m[1].trim()).filter(Boolean);
		const clean = chunk.replace(TAG, ' ').replace(/\s+/g, ' ').trim();
		const steps = tags.flatMap((tag) =>
			tag
				.split(/,?\s*\bpuis\b\s*/)
				.map((part) => part.trim())
				.filter(Boolean)
				.map((part) => ({emotion: part, pose: emotionToPose(part)})),
		);
		const emotional = steps.filter((step): step is {emotion: string; pose: AvatarPose} => step.pose !== null);
		if (emotional.length > 0) {
			queued = emotional;
			pendingEmotion = tags.join(', ');
		}
		// Une balise seule (sans texte lu) s'applique à la phrase suivante.
		if (/[\p{L}\p{N}]/u.test(clean)) {
			// La dernière étape (« rire ») reste valable pour les phrases suivantes.
			const step = queued.shift();
			if (step) {
				pose = step.pose;
			}
			sentences.push({text: clean, words: toWords(clean), emotion: pendingEmotion ?? step?.emotion ?? null, pose});
			pendingEmotion = null;
		}
	}
	return sentences;
};
