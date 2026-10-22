import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {atelierExtras, SAFE_ZONE, SOFT_SPRING, THEMES, type ThemeId} from '../../theme';
import {CODE_FONT, FONTS} from '../../theme/fonts';
import type {Beats} from './beats';

const useSpringAt = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return (ms: number, durationInFrames = 18) =>
		spring({frame: frame - Math.round((ms / 1000) * fps), fps, config: SOFT_SPRING, durationInFrames});
};

export const Background: React.FC<{theme: ThemeId}> = ({theme}) => {
	if (theme === 'atelier') {
		return (
			<AbsoluteFill style={{background: atelierExtras.wall}}>
				{/* Sol en perspective isométrique. */}
				<div
					style={{
						position: 'absolute',
						left: -400,
						right: -400,
						top: 1180,
						height: 1400,
						background: atelierExtras.floor,
						transform: 'perspective(1200px) rotateX(55deg)',
						transformOrigin: 'top center',
					}}
				/>
				<div style={{position: 'absolute', left: 0, right: 0, top: 1150, height: 60, background: 'linear-gradient(to bottom, transparent, rgba(60,30,20,0.12))'}} />
			</AbsoluteFill>
		);
	}
	return <AbsoluteFill style={{background: THEMES[theme].colors.background}} />;
};

// Étiquettes « Atelier » : apparaissent quand le terme est prononcé.
export const AtelierLabels: React.FC<{labels: {text: string; ms: number; x: number; y: number}[]; hideMs: number}> = ({labels, hideMs}) => {
	const at = useSpringAt();
	const hide = at(hideMs, 12);
	return (
		<>
			{labels.map((label) => {
				const s = at(label.ms);
				return (
					<div
						key={label.text}
						style={{
							position: 'absolute',
							left: label.x,
							top: label.y,
							padding: '14px 28px',
							borderRadius: 18,
							background: atelierExtras.labelBackground,
							color: atelierExtras.labelText,
							fontFamily: FONTS.body,
							fontWeight: 700,
							fontSize: 44,
							opacity: s * (1 - hide),
							transform: `translateY(${(1 - s) * 20}px) scale(${interpolate(s, [0, 1], [0.9, 1])})`,
							boxShadow: atelierExtras.softShadow,
							whiteSpace: 'nowrap',
						}}
					>
						{label.text}
					</div>
				);
			})}
		</>
	);
};

type Tok = {text: string; color: string};
const k = (text: string): Tok => ({text, color: THEMES['ecran-code'].colors.tertiary});
const s = (text: string): Tok => ({text, color: THEMES['ecran-code'].colors.secondary});
const n = (text: string): Tok => ({text, color: THEMES['ecran-code'].colors.accent});
const p = (text: string): Tok => ({text, color: THEMES['ecran-code'].colors.ink});
const m = (text: string): Tok => ({text, color: '#7A869C'});

// Fenêtre d'éditeur : le code s'écrit ligne par ligne, calé sur la voix.
export const CodeEditor: React.FC<{beats: Beats}> = ({beats}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const at = useSpringAt();
	const c = THEMES['ecran-code'].colors;
	const lines: {ms: number; toks: Tok[]}[] = [
		{ms: beats.notebookMs + 300, toks: [m('// un carnet numéroté')]},
		{ms: beats.arrayMs, toks: [k('const '), p('carnet = [')]},
		{ms: beats.arrayMs + 450, toks: [p('  '), s('"pain"'), p(', '), s('"lait"'), p(',')]},
		{ms: beats.arrayMs + 900, toks: [p('  '), s('"œufs"'), p(', '), s('"riz"'), p(',')]},
		{ms: beats.arrayMs + 1350, toks: [p('];')]},
		{ms: beats.pickMs, toks: [p('carnet['), n('2'), p(']; '), m('// "œufs"')]},
	];
	const appear = at(0, 20);
	const leave = at(beats.outroMs, 15);
	const typingMs = 420;
	const nowMs = (frame / fps) * 1000;

	return (
		<div
			style={{
				position: 'absolute',
				left: SAFE_ZONE.left,
				right: SAFE_ZONE.right,
				top: SAFE_ZONE.top + 20,
				height: 500,
				borderRadius: 32,
				background: c.surface,
				border: '2px solid #26304A',
				boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
				opacity: appear * (1 - leave),
				transform: `translateY(${(1 - appear) * 40}px)`,
				overflow: 'hidden',
			}}
		>
			<div style={{height: 64, display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 28, background: '#1B2540'}}>
				{['#E5383B', c.accent, c.secondary].map((dot) => (
					<div key={dot} style={{width: 20, height: 20, borderRadius: 10, background: dot}} />
				))}
				<span style={{marginLeft: 20, fontFamily: CODE_FONT, fontSize: 26, color: '#7A869C'}}>carnet.js</span>
			</div>
			<div style={{padding: '28px 32px', fontFamily: CODE_FONT, fontSize: 38, lineHeight: 1.6, whiteSpace: 'pre'}}>
				{lines.map((line, i) => {
					const total = line.toks.reduce((sum, t) => sum + t.text.length, 0);
					const shown = Math.floor(interpolate(nowMs, [line.ms, line.ms + typingMs], [0, total], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
					let left = shown;
					return (
						<div key={i} style={{height: '1.6em'}}>
							{line.toks.map((t, j) => {
								const part = t.text.slice(0, Math.max(0, left));
								left -= t.text.length;
								return (
									<span key={j} style={{color: t.color}}>
										{part}
									</span>
								);
							})}
						</div>
					);
				})}
			</div>
		</div>
	);
};
