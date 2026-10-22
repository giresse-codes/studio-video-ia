// Prépare la version HyperFrames d'Astuces #1 à partir des mêmes sources que la version Remotion :
// script (balises retirées, émotions → poses), calage sur les pauses de la voix, plan des scènes.
// Usage : npx tsx scripts/hyperframes-astuces-001.ts
import {copyFileSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {alignToPauses, detectPauses} from '../src/lib/align';
import {pagesByWordCount} from '../src/lib/caption-pages';
import {parseScript} from '../src/lib/script';
import {assignScenes} from '../src/compositions/astuces-001/scene-plan';

const PROJECT = 'hyperframes/astuces-001';
const FPS = 30;

// WAV PCM 16 bits mono → échantillons entre -1 et 1.
const readWav = (path: string) => {
	const buf = readFileSync(path);
	const sampleRate = buf.readUInt32LE(24);
	let offset = 12;
	while (buf.toString('ascii', offset, offset + 4) !== 'data') {
		offset += 8 + buf.readUInt32LE(offset + 4);
	}
	const length = buf.readUInt32LE(offset + 4) / 2;
	const samples = new Float32Array(length);
	for (let i = 0; i < length; i++) {
		samples[i] = buf.readInt16LE(offset + 8 + i * 2) / 32768;
	}
	return {samples, sampleRate};
};

const {samples, sampleRate} = readWav('public/audio/astuces-001.wav');
const durationMs = Math.round((samples.length / sampleRate) * 1000);
const sentences = parseScript(readFileSync('channels/astuces/scripts/001-telephone-chauffe.md', 'utf8'));
const {words, sentences: timings} = alignToPauses(
	sentences.map((s) => s.words),
	detectPauses(samples, sampleRate),
	durationMs,
);
const sceneStarts = assignScenes(sentences);
const scenes = sceneStarts.map((sentence, k) => ({
	start: k === 0 ? 0 : timings[sentence].startMs / 1000,
	end: k === sceneStarts.length - 1 ? durationMs / 1000 : timings[sceneStarts[k + 1]].startMs / 1000,
}));

// Volume de la voix par image (RMS en dB), pour la bouche de l'avatar.
const perFrame = Math.round(sampleRate / FPS);
const mouth: number[] = [];
for (let i = 0; i < samples.length; i += perFrame) {
	let sum = 0;
	const end = Math.min(samples.length, i + perFrame);
	for (let j = i; j < end; j++) {
		sum += samples[j] * samples[j];
	}
	const db = 20 * Math.log10(Math.sqrt(sum / (end - i)) + 1e-9);
	// -42 dB (silence) → fermée, -18 dB (voix forte) → grande ouverte.
	mouth.push(Math.round(Math.min(1, Math.max(0, (db + 42) / 24)) * 100) / 100);
}

const timing = {
	durationSec: durationMs / 1000,
	scenes,
	sentences: sentences.map((s, i) => ({text: s.text, emotion: s.emotion, pose: s.pose, start: timings[i].startMs / 1000, end: timings[i].endMs / 1000})),
	words: words.map((w) => ({text: w.text, start: w.startMs / 1000, end: w.endMs / 1000, sentence: w.sentence})),
	captionPages: pagesByWordCount(words, 4).map((p) => p.tokens.map((t) => ({text: t.text.trim(), start: t.fromMs / 1000, end: t.toMs / 1000}))),
	mouth,
};

writeFileSync(`${PROJECT}/timing.json`, JSON.stringify(timing, null, '\t') + '\n');

// La voix est copiée dans le projet (chemins d'assets relatifs à la racine du projet).
mkdirSync(`${PROJECT}/assets/audio`, {recursive: true});
copyFileSync('public/audio/astuces-001.wav', `${PROJECT}/assets/audio/astuces-001.wav`);

const r = (x: number) => Math.round(x * 1000) / 1000;
const normalize = (s: string) =>
	s
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]/g, '');
// Temps absolu du n-ième mot de la scène k qui commence par `prefix`.
const wordAt = (k: number, prefix: string, nth = 0) => {
	const {start, end} = scenes[k];
	const found = timing.words.filter((w) => w.start >= start - 0.05 && w.start < end && normalize(w.text).startsWith(prefix))[nth];
	if (!found) {
		throw new Error(`Mot « ${prefix} » (n°${nth}) introuvable dans la scène ${k + 1}`);
	}
	return found.start;
};

// Bruitages : chacun a une cause à l'écran (coupe, étiquette, carte, chiffre).
const cues: [number, string][] = [
	...scenes.slice(1).map((s, i): [number, string] => [s.start - 0.05, `whoosh-${(i % 3) + 1}`]),
	[wordAt(0, 'lit'), 'pop-1'],
	[wordAt(0, 'chat'), 'pop-2'],
	[wordAt(1, 'batterie') + 0.3, 'ding-1'],
	[wordAt(1, 'perd'), 'pop-1'],
	[wordAt(1, 'chargeur'), 'pop-2'],
	[wordAt(1, 'batterie', 1), 'pop-1'],
	[wordAt(1, 'chaleur'), 'pop-2'],
	[wordAt(2, 'chargeur') + 0.38, 'pop-2'],
	[wordAt(2, 'heures'), 'pop-1'],
	[wordAt(4, 'sauna'), 'pop-1'],
	[wordAt(5, 'lithium'), 'pop-1'],
	[wordAt(5, 'plus', 0), 'pop-2'],
	[wordAt(5, 'plus', 1), 'pop-2'],
	[wordAt(6, 'trois', 0), 'pop-1'],
	[wordAt(6, 'une', 0), 'ding-1'],
	[wordAt(6, 'deux'), 'ding-2'],
	[wordAt(6, 'trois', 1), 'ding-1'],
	[wordAt(7, 'manger'), 'pop-2'],
	[wordAt(8, 'commentaire'), 'ding-2'],
];
cues.sort((a, b) => a[0] - b[0]);

const SCENE_FILES = ['hook', 'coupe', 'chargeur', 'table', 'sauna', 'lithium', 'cartes', 'marathon', 'question'];
const EXIT = 0.3;
const hosts = scenes
	.map((s, k) => {
		const id = `s${k + 1}`;
		const duration = k === scenes.length - 1 ? s.end - s.start : s.end - s.start + EXIT;
		return `\t\t\t<div id="${id}" class="clip" data-composition-id="${id}" data-composition-src="compositions/${k + 1}-${SCENE_FILES[k]}.html" data-start="${r(s.start)}" data-duration="${r(duration)}" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index: ${k + 2}"></div>`;
	})
	.join('\n');
// Durée de chaque bruitage (s) ; les pistes alternent pour que deux sons proches ne se chevauchent pas.
const SFX_SECONDS: Record<string, number> = {'pop-1': 0.18, 'pop-2': 0.2, 'whoosh-1': 0.43, 'whoosh-2': 0.51, 'whoosh-3': 0.59, 'ding-1': 0.9, 'ding-2': 0.8};
const sfx = cues
	.map(
		([t, name], i) =>
			`\t\t\t<audio id="sfx-${i + 1}" class="clip" src="assets/sfx/${name}.wav" data-start="${r(t)}" data-duration="${r(Math.min(SFX_SECONDS[name], timing.durationSec - t))}" data-track-index="${5 + (i % 3)}" data-volume="1"></audio>`,
	)
	.join('\n');

// Données lues par les scènes et l'avatar (aucun chargement réseau au rendu).
const A1 = {
	durationSec: timing.durationSec,
	scenes: scenes.map((s) => ({start: r(s.start), end: r(s.end)})),
	words: timing.words.map((w) => ({text: w.text, start: r(w.start), end: r(w.end)})),
	sentences: timing.sentences.map((s) => ({start: r(s.start), pose: s.pose})),
	mouth: timing.mouth,
};

const index = `<!doctype html>
<!-- Généré par scripts/hyperframes-astuces-001.ts : ne pas modifier à la main (les scènes sont dans compositions/). -->
<html lang="fr">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=1080, height=1920" />
		<script src="assets/vendor/gsap.min.js"></script>
		<script src="assets/lib/scene-kit.js"></script>
		<link rel="stylesheet" href="assets/lib/scene.css" />
		<script>
			window.A1 = ${JSON.stringify(A1)};
		</script>
		<style>
			* {
				margin: 0;
				padding: 0;
				box-sizing: border-box;
			}
			html,
			body {
				width: 1080px;
				height: 1920px;
				overflow: hidden;
				background: #d8b7a4;
			}
			#room {
				position: absolute;
				inset: 0;
				overflow: hidden;
				background: #d8b7a4;
			}
			/* Sol en perspective, comme la version Remotion. */
			#room-floor {
				position: absolute;
				left: -400px;
				right: -400px;
				top: 1180px;
				height: 1400px;
				background: #b8a9d6;
				transform: perspective(1200px) rotateX(55deg);
				transform-origin: top center;
			}
		</style>
	</head>
	<body>
		<div id="root" data-composition-id="main" data-start="0" data-duration="${r(timing.durationSec)}" data-width="1080" data-height="1920">
			<div id="room" data-layout-ignore><div id="room-floor"></div></div>
${hosts}
			<div id="avatar" class="clip" data-composition-id="avatar" data-composition-src="compositions/avatar.html" data-start="0" data-duration="${r(timing.durationSec)}" data-track-index="2" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index: 20"></div>
			<div id="captions" class="clip" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="${r(timing.durationSec)}" data-track-index="3" data-track-kind="captions" data-width="1080" data-height="1920" style="z-index: 30"></div>
			<audio id="voice" class="clip" src="assets/audio/astuces-001.wav" data-start="0" data-track-index="4" data-volume="1"></audio>
${sfx}
		</div>
		<script>
			window.__timelines = window.__timelines || {};
			window.__timelines['main'] = gsap.timeline({paused: true});
		</script>
	</body>
</html>
`;
writeFileSync(`${PROJECT}/index.html`, index);

// Sous-titres : groupes de 3 à 4 mots, mot actif en jaune, dans la zone sûre (80 / 130 / 380 px).
const LINGER = 1.2;
const groups = timing.captionPages.map((page, g) => {
	const next = timing.captionPages[g + 1];
	const start = Math.max(0, page[0].start - 0.05);
	const end = Math.min(next ? next[0].start - 0.05 : timing.durationSec, page[page.length - 1].end + LINGER);
	return {g, start, end, page};
});
const groupHtml = groups
	.map(
		({g, start, end, page}) =>
			`\t\t<div id="cg-${g}" class="clip cg" data-start="${r(start)}" data-duration="${r(end - start)}"><div id="cgi-${g}" class="cg-in">${page
				.map((w, j) => `<span id="cw-${g}-${j}" class="cw">${j === 0 ? '' : ' '}${w.text}</span>`)
				.join('')}</div></div>`,
	)
	.join('\n');
const groupScript = groups
	.map(({g, start, end, page}) => {
		// Groupe très court : entrée et sortie raccourcies pour ne pas se chevaucher.
		const enter = Math.min(0.3, (end - start) / 3);
		const lines = [`\t\t\ttl.fromTo('#cgi-${g}', {opacity: 0, y: 24, scale: 0.94}, {opacity: 1, y: 0, scale: 1, duration: ${r(enter)}, ease: 'expo.out'}, ${r(start)});`];
		page.forEach((w, j) => {
			const off = page[j + 1] ? page[j + 1].start : w.end;
			lines.push(`\t\t\ttl.set('#cw-${g}-${j}', {color: '#FFD23F'}, ${r(w.start)}).set('#cw-${g}-${j}', {color: '#FFFFFF'}, ${r(Math.max(w.start + 0.05, off))});`);
		});
		const exit = Math.min(0.12, (end - start) / 4);
		lines.push(`\t\t\ttl.to('#cgi-${g}', {opacity: 0, duration: ${r(exit)}, ease: 'power2.in'}, ${r(end - exit)});`);
		return lines.join('\n');
	})
	.join('\n');
const captions = `<!-- Généré par scripts/hyperframes-astuces-001.ts : ne pas modifier à la main. -->
<template>
	<style>
		#root {
			position: absolute;
			inset: 0;
		}
		.cg-in {
			position: absolute;
			left: 80px;
			width: 870px;
			bottom: 380px;
			text-align: center;
			font-family: Inter;
			font-weight: 800;
			font-size: 56px;
			line-height: 1.25;
			word-spacing: 8px;
		}
		.cw {
			color: #ffffff;
			-webkit-text-stroke: 12px #000000;
			paint-order: stroke fill;
			white-space: pre-wrap;
		}
	</style>
	<div id="root" data-composition-id="captions" data-width="1080" data-height="1920">
${groupHtml}
	</div>
	<script>
		(function () {
			const tl = gsap.timeline({paused: true});
${groupScript}
			window.__timelines['captions'] = tl;
		})();
	</script>
</template>
`;
writeFileSync(`${PROJECT}/compositions/captions.html`, captions);
console.log(`index.html, compositions/captions.html : ${groups.length} groupes, ${cues.length} bruitages, ${scenes.length} scènes`);
