// Rend la composition StyleTest dans les trois thèmes : out/style-tests/<theme>.mp4
// Usage : npm run render:style-tests [-- <fichier audio dans public/audio/>]
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import {THEME_IDS} from '../src/theme';
import {webpackOverride} from '../src/webpack-override';

const audioFile = process.argv[2];
// Chrome à utiliser à la place de celui que Remotion télécharge (facultatif).
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ?? null;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), webpackOverride});

for (const theme of THEME_IDS) {
	const inputProps = {theme, ...(audioFile ? {audioFile} : {})};
	const composition = await selectComposition({serveUrl, id: 'StyleTest', inputProps, browserExecutable});
	const outputLocation = `out/style-tests/${theme}.mp4`;
	await renderMedia({composition, serveUrl, codec: 'h264', outputLocation, inputProps, browserExecutable});
	console.log(`${outputLocation} (${composition.durationInFrames} images)`);
}
