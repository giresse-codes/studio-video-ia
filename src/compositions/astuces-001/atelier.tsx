import React, {createContext, useContext} from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {AlignedWord} from '../../lib/align';
import {atelierExtras, SAFE_ZONE, SOFT_SPRING} from '../../theme';
import {FONTS} from '../../theme/fonts';

// Briques communes des scènes « Atelier » d'Astuces #1.

export const STAGE = {left: SAFE_ZONE.left, top: 170, width: 870, height: 620} as const;

// Couleurs hors palette STYLE.md, demandées par les scènes (flèche dorée, flèches rouges, vagues orange).
export const EXTRA = {
	gold: '#F2B33D',
	red: '#E5383B',
	orange: '#F08A4B',
	duvet: '#EFE6F7',
	duvetShade: '#D9CBEA',
	wood: '#A9826B',
	woodDark: '#8C6957',
	white: '#FFFFFF',
	ink: '#1A1A1A',
	screen: '#2B3445',
} as const;

export const SHADOW = 'drop-shadow(0 18px 24px rgba(60, 30, 20, 0.25))';

type SceneInfo = {startMs: number; endMs: number; words: AlignedWord[]};
const SceneContext = createContext<SceneInfo>({startMs: 0, endMs: 0, words: []});
export const SceneProvider = SceneContext.Provider;

// Temps de la scène et ressorts calés soit sur un mot prononcé, soit sur une fraction de la scène.
export const useScene = () => {
	const scene = useContext(SceneContext);
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const nowMs = (frame / fps) * 1000;
	const duration = scene.endMs - scene.startMs;
	const atFraction = (f: number) => scene.startMs + duration * f;
	const normalize = (s: string) =>
		s
			.toLowerCase()
			.normalize('NFD')
			.replace(/[̀-ͯ]/g, '')
			.replace(/[^a-z0-9]/g, '');
	// Début du premier mot de la scène commençant par `prefix`, sinon la fraction de repli.
	const word = (prefix: string, fallbackFraction: number) =>
		scene.words.find((w) => w.startMs >= scene.startMs - 50 && w.startMs < scene.endMs && normalize(w.text).startsWith(prefix))?.startMs ??
		atFraction(fallbackFraction);
	const springAt = (ms: number, durationInFrames = 18) =>
		spring({frame: frame - Math.round((ms / 1000) * fps), fps, config: SOFT_SPRING, durationInFrames});
	const progress = (fromMs: number, toMs: number) =>
		interpolate(nowMs, [fromMs, toMs], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return {...scene, nowMs, frame, fps, duration, atFraction, word, springAt, progress};
};

// Étiquette « Atelier » : fond noir, texte bleu clair, apparaît quand le mot est dit.
export const Label: React.FC<{text: string; atMs: number; x: number; y: number; size?: number}> = ({text, atMs, x, y, size = 52}) => {
	const {springAt} = useScene();
	const s = springAt(atMs);
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				padding: '14px 30px',
				borderRadius: 20,
				background: atelierExtras.labelBackground,
				color: atelierExtras.labelText,
				fontFamily: FONTS.body,
				fontWeight: 800,
				fontSize: size,
				whiteSpace: 'nowrap',
				boxShadow: atelierExtras.softShadow,
				opacity: s,
				transform: `translateY(${(1 - s) * 24}px) scale(${interpolate(s, [0, 1], [0.9, 1])})`,
			}}
		>
			{text}
		</div>
	);
};

// Grand titre (Poppins ExtraBold), entrée douce.
export const Title: React.FC<{text: string; atMs: number; y: number; size?: number; color?: string}> = ({text, atMs, y, size = 104, color = EXTRA.ink}) => {
	const {springAt} = useScene();
	const s = springAt(atMs, 20);
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				width: STAGE.width,
				top: y,
				textAlign: 'center',
				fontFamily: FONTS.title,
				fontWeight: FONTS.titleWeight,
				fontSize: size,
				lineHeight: 1.05,
				color,
				opacity: s,
				transform: `scale(${interpolate(s, [0, 1], [0.8, 1])})`,
			}}
		>
			{text}
		</div>
	);
};

// Téléphone générique : coque métal arrondie, écran verre. Origine au centre.
export const Phone: React.FC<{w?: number; h?: number; screenGlow?: number; children?: React.ReactNode}> = ({w = 180, h = 340, screenGlow = 0, children}) => (
	<g>
		<rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.2} fill={atelierExtras.metal} />
		<rect x={-w / 2 + 12} y={-h / 2 + 12} width={w - 24} height={h - 24} rx={w * 0.15} fill={EXTRA.screen} />
		<rect x={-w / 2 + 12} y={-h / 2 + 12} width={w - 24} height={h - 24} rx={w * 0.15} fill={atelierExtras.glass} opacity={0.35 + screenGlow * 0.5} />
		<rect x={-w * 0.16} y={-h / 2 + 22} width={w * 0.32} height={10} rx={5} fill={EXTRA.ink} opacity={0.6} />
		{children}
	</g>
);

// Chargeur : bloc métal avec deux broches. Origine au centre.
export const Charger: React.FC<{w?: number; h?: number}> = ({w = 150, h = 120}) => (
	<g>
		<rect x={-w / 2 + 30} y={-h / 2 - 34} width={14} height={40} rx={5} fill="#8F969E" />
		<rect x={w / 2 - 44} y={-h / 2 - 34} width={14} height={40} rx={5} fill="#8F969E" />
		<rect x={-w / 2} y={-h / 2} width={w} height={h} rx={28} fill={atelierExtras.metal} />
		<rect x={-w / 2 + 14} y={-h / 2 + 14} width={w - 28} height={18} rx={9} fill={EXTRA.white} opacity={0.45} />
	</g>
);

// Flèche épaisse à extrémité arrondie, dessinée progressivement (`draw` de 0 à 1).
export const Arrow: React.FC<{d: string; color: string; draw: number; width?: number; length?: number}> = ({d, color, draw, width = 22, length = 600}) => (
	<path
		d={d}
		fill="none"
		stroke={color}
		strokeWidth={width}
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeDasharray={length}
		strokeDashoffset={length * (1 - draw)}
	/>
);

export const ArrowHead: React.FC<{x: number; y: number; angle: number; color: string; scale: number}> = ({x, y, angle, color, scale}) => (
	<path d="M -26 -24 L 18 0 L -26 24 Z" fill={color} stroke={color} strokeWidth={10} strokeLinejoin="round" transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`} />
);

// Couette arrondie (vue de face) ; `w` de large, origine en haut au centre.
export const Duvet: React.FC<{w: number; h: number}> = ({w, h}) => (
	<g filter="url(#soft)">
		<path
			d={`M ${-w / 2} ${h} Q ${-w / 2 - 20} ${h * 0.25} ${-w * 0.25} ${h * 0.12} Q 0 ${-h * 0.18} ${w * 0.25} ${h * 0.1} Q ${w / 2 + 20} ${h * 0.25} ${w / 2} ${h} Z`}
			fill={EXTRA.duvet}
		/>
		<path d={`M ${-w * 0.3} ${h * 0.45} Q 0 ${h * 0.3} ${w * 0.3} ${h * 0.5}`} stroke={EXTRA.duvetShade} strokeWidth={10} fill="none" strokeLinecap="round" />
		<path d={`M ${-w * 0.38} ${h * 0.75} Q 0 ${h * 0.6} ${w * 0.38} ${h * 0.78}`} stroke={EXTRA.duvetShade} strokeWidth={10} fill="none" strokeLinecap="round" />
	</g>
);

// Scène SVG à la taille de la zone de jeu, avec un filtre d'ombre douce partagé.
export const StageSvg: React.FC<{children: React.ReactNode}> = ({children}) => (
	<svg viewBox={`0 0 ${STAGE.width} ${STAGE.height}`} width={STAGE.width} height={STAGE.height} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
		<defs>
			<filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
				<feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#3C1E14" floodOpacity="0.22" />
			</filter>
		</defs>
		{children}
	</svg>
);
