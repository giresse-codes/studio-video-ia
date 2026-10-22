// npm run nouvelle-video -- <chaine> <numero> <slug>     (ex. : npm run nouvelle-video -- astuces 2 cable-abime)
// Crée le script, la vidéo HyperFrames (video.json, modèle d'ancres, première scène vide) et dit quoi faire ensuite.
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {CHAINES, type Chaine, HYPERFRAMES_VERSION} from '../config';

const RACINE = path.resolve(import.meta.dirname, '../..');
const modele = (nom: string, valeurs: Record<string, string | number>) =>
	readFileSync(path.join(RACINE, 'kit/modeles', nom), 'utf8').replace(/\{\{(\w+)\}\}/g, (_, cle) => String(valeurs[cle] ?? `{{${cle}}}`));

const ecrireSiAbsent = (fichier: string, contenu: string, crees: string[]) => {
	if (existsSync(fichier)) {
		console.log(`= ${fichier} existe déjà, laissé tel quel`);
		return;
	}
	mkdirSync(path.dirname(fichier), {recursive: true});
	writeFileSync(fichier, contenu);
	crees.push(fichier);
};

const [chaineArg, numeroArg, slug] = process.argv.slice(2);
const chaine = chaineArg as Chaine;
if (!CHAINES[chaine] || !/^\d{1,3}$/.test(numeroArg ?? '') || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug ?? '')) {
	console.error(`Usage : npm run nouvelle-video -- <${Object.keys(CHAINES).join('|')}> <numero> <slug-en-minuscules>`);
	process.exit(1);
}
const numero = numeroArg.padStart(3, '0');
const id = `${chaine}-${numero}`;
const regles = CHAINES[chaine];
const titre = slug.replace(/-/g, ' ');
const script = `channels/${chaine}/scripts/${numero}-${slug}.md`;
const audio = `public/audio/${id}.wav`;
const dossier = path.join('hyperframes', id);
const crees: string[] = [];

ecrireSiAbsent(
	script,
	modele('script.md', {CHAINE: regles.nom, NUMERO: numero, TITRE: titre, DUREE_MIN: regles.dureeSec[0], DUREE_MAX: regles.dureeSec[1], MOTS_MIN: regles.mots[0], MOTS_MAX: regles.mots[1]}),
	crees,
);
ecrireSiAbsent(
	path.join(dossier, 'video.json'),
	JSON.stringify(
		{
			chaine,
			numero,
			slug,
			script,
			audio,
			scenes: [{id: 's1', fichier: 'compositions/s1.html', debut: '@0', transition: 'zoom', cible: [450, 730]}],
			bruitages: [],
			avatar: {cote: 'droite'},
		},
		null,
		'\t',
	) + '\n',
	crees,
);
ecrireSiAbsent(path.join(dossier, 'ancres.md'), modele('ancres.md', {VIDEO: id}), crees);
ecrireSiAbsent(path.join(dossier, 'compositions/s1.html'), modele('scene.html', {ID: 's1'}), crees);
ecrireSiAbsent(path.join(dossier, 'meta.json'), JSON.stringify({id, name: id}, null, '\t') + '\n', crees);
ecrireSiAbsent(
	path.join(dossier, 'hyperframes.json'),
	JSON.stringify({$schema: 'https://hyperframes.heygen.com/schema/hyperframes.json', paths: {blocks: 'compositions', assets: 'assets'}, media: {autoProxy: true}}, null, '\t') + '\n',
	crees,
);
ecrireSiAbsent(
	path.join(dossier, 'package.json'),
	JSON.stringify(
		{
			name: id,
			private: true,
			type: 'module',
			scripts: {
				dev: `npx --yes hyperframes@${HYPERFRAMES_VERSION} preview`,
				check: `npx --yes hyperframes@${HYPERFRAMES_VERSION} check`,
				render: `npx --yes hyperframes@${HYPERFRAMES_VERSION} render --quality delivery --output ../../out/${id}.mp4`,
			},
		},
		null,
		'\t',
	) + '\n',
	crees,
);

console.log(crees.map((f) => `+ ${f}`).join('\n'));
console.log(`
Suite pour ${id} (${regles.nom}, ${regles.dureeSec[0]}–${regles.dureeSec[1]} s, ${regles.mots[0]}–${regles.mots[1]} mots) :
  1. écrire le script : ${script}
  2. déposer la voix (WAV) : ${audio}
  3. découper en scènes dans ${dossier}/video.json (une scène = un fichier, début sur un @mot) et planifier ${dossier}/ancres.md
  4. npm run preparer -- ${id}     puis     npm run verifier -- ${id}`);
