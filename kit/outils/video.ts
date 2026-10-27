// Description d'une vidéo : hyperframes/<chaine>-<numero>/video.json.
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {CHAINES, type Chaine} from '../config';

export type Video = {
	id: string;
	chaine: Chaine;
	numero: string;
	slug: string;
	// Chemins depuis la racine du dépôt.
	script: string;
	audio: string;
	// Chaque scène commence sur un mot (@mot) ; la première à 0 s. `cible` : centre de l'objet principal (px),
	// que l'avatar regarde et vers lequel zoome S.zoomMot.
	scenes: {id: string; fichier: string; debut: string; transition?: 'zoom' | 'balayage'; cible: [number, number]}[];
	// Bruitages de gags, liés à un mot.
	bruitages?: {ancre: string; son: string; scene?: string}[];
	// Tenue de l'avatar : blanche (par défaut) ou bleue. `false` : vidéo sans avatar (Mode Survie).
	avatar?: false | {cote?: 'droite' | 'gauche'; tenue?: 'blanche' | 'bleue'};
	// Palette de la vidéo (STYLE.md de la chaîne) : « atelier » (par défaut), « schema » ou « alerte ». Le style « Écran code » s'utilise dans une scène.
	theme?: 'atelier' | 'schema' | 'alerte';
	// Calques fixes sur toute la vidéo, au-dessus des scènes (horodatage, compte à rebours, jauge…). Leurs ancres se lisent depuis 0 s.
	calques?: {id: string; fichier: string}[];
};

export const dossierVideo = (id: string) => path.join('hyperframes', id);

export const chargerVideo = (id: string): Video => {
	const fichier = path.join(dossierVideo(id), 'video.json');
	if (!existsSync(fichier)) {
		throw new Error(`${fichier} introuvable (créer la vidéo avec npm run nouvelle-video -- <chaine> <numero> <slug>)`);
	}
	const video = {id, ...JSON.parse(readFileSync(fichier, 'utf8'))} as Video;
	if (!CHAINES[video.chaine]) {
		throw new Error(`${fichier} : chaîne inconnue « ${video.chaine} » (${Object.keys(CHAINES).join(', ')})`);
	}
	if (video.scenes.length === 0) {
		throw new Error(`${fichier} : aucune scène`);
	}
	return video;
};
