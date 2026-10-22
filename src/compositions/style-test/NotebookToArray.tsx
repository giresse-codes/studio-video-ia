import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SOFT_SPRING} from '../../theme';
import {FONTS} from '../../theme/fonts';
import type {Beats} from './beats';
import type {Skin} from './skins';

const VALUES = ['pain', 'lait', 'œufs', 'riz'];
const PICKED = 2;

type Box = {x: number; y: number; w: number; h: number; rot: number};

const mix = (a: Box, b: Box, t: number): Box => ({
	x: a.x + (b.x - a.x) * t,
	y: a.y + (b.y - a.y) * t,
	w: a.w + (b.w - a.w) * t,
	h: a.h + (b.h - a.h) * t,
	rot: a.rot + (b.rot - a.rot) * t,
});

// Positions relatives au centre de la forme.
const closedBox = (i: number): Box => ({x: -260 + i * 7, y: -340 + i * 7, w: 520, h: 680, rot: 0});
const openBox = (i: number): Box => ({x: -150 + (i - 1.5) * 220, y: -200 + Math.abs(i - 1.5) * 18, w: 300, h: 400, rot: (i - 1.5) * 7});
const arrayBox = (i: number): Box => ({x: -424 + i * 216, y: -100, w: 200, h: 200, rot: 0});

// Un carnet qui s'ouvre, dont les pages se rangent en tableau numéroté.
export const NotebookToArray: React.FC<{beats: Beats; skin: Skin}> = ({beats, skin}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const at = (ms: number, durationInFrames = 24) =>
		spring({frame: frame - Math.round((ms / 1000) * fps), fps, config: SOFT_SPRING, durationInFrames});

	const appear = at(beats.notebookMs, 20);
	const open = at(beats.openMs);
	const toArray = at(beats.arrayMs, 30);
	const pick = at(beats.pickMs, 18);
	const leave = at(beats.outroMs, 15);

	const indexOpacity = interpolate(toArray, [0.6, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: 0,
				opacity: appear * (1 - leave),
				transform: `scale(${interpolate(appear, [0, 1], [0.85, 1]) * interpolate(leave, [0, 1], [1, 0.8])})`,
			}}
		>
			{VALUES.map((value, i) => {
				const box = mix(mix(closedBox(i), openBox(i), open), arrayBox(i), toArray);
				const picked = i === PICKED ? pick : 0;
				const lift = picked * -40;
				const fill = skin.fillsCells ? toArray : 1;
				return (
					<div
						key={value}
						style={{
							position: 'absolute',
							left: box.x,
							top: box.y + lift,
							width: box.w,
							height: box.h,
							transform: `rotate(${box.rot}deg) scale(${1 + picked * 0.12})`,
							zIndex: 10 - i,
							...skin.page(picked),
							overflow: 'hidden',
						}}
					>
						{skin.fillsCells ? (
							<div
								style={{
									position: 'absolute',
									left: 0,
									right: 0,
									bottom: 0,
									height: `${fill * 100}%`,
									background: picked > 0.5 ? skin.pickColor : skin.cellFill,
								}}
							/>
						) : null}
						{skin.paperLines ? (
							<div
								style={{
									position: 'absolute',
									inset: 0,
									opacity: 1 - toArray,
									backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 38px, ${skin.paperLines} 38px 41px)`,
									backgroundPosition: '0 70px',
								}}
							/>
						) : null}
						<div
							style={{
								position: 'absolute',
								inset: 0,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontFamily: FONTS.body,
								fontWeight: 700,
								fontSize: interpolate(toArray, [0, 1], [56, 48]),
								color: skin.pageText,
								opacity: open,
							}}
						>
							{value}
						</div>
						{/* Numéro de page, en bas de la feuille. */}
						<div
							style={{
								position: 'absolute',
								bottom: 16,
								width: '100%',
								textAlign: 'center',
								fontFamily: FONTS.body,
								fontSize: 30,
								color: skin.pageText,
								opacity: open * (1 - toArray),
							}}
						>
							page {i}
						</div>
					</div>
				);
			})}
			{/* Couverture du carnet. */}
			<div
				style={{
					position: 'absolute',
					left: -260,
					top: -340,
					width: 520,
					height: 680,
					zIndex: 20,
					transformOrigin: 'left center',
					transform: `perspective(1600px) rotateY(${-open * 100}deg)`,
					opacity: interpolate(open, [0, 0.7], [1, 0], {extrapolateRight: 'clamp'}),
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					...skin.cover,
				}}
			>
				<span style={{fontFamily: FONTS.title, fontWeight: FONTS.titleWeight, fontSize: 84, color: skin.coverText}}>Carnet</span>
			</div>
			{/* Numéros des cases, sous le tableau. */}
			{VALUES.map((value, i) => (
				<div
					key={`index-${value}`}
					style={{
						position: 'absolute',
						left: arrayBox(i).x,
						top: 120 + (i === PICKED ? pick * 10 : 0),
						width: 200,
						textAlign: 'center',
						fontFamily: FONTS.title,
						fontWeight: FONTS.titleWeight,
						fontSize: 64 + (i === PICKED ? pick * 22 : 0),
						color: i === PICKED && pick > 0.5 ? skin.pickColor : skin.indexColor,
						opacity: indexOpacity,
						transform: `translateY(${(1 - indexOpacity) * 20}px)`,
					}}
				>
					{i}
				</div>
			))}
		</div>
	);
};
