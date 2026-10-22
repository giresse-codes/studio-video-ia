import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadJetBrainsMono} from '@remotion/google-fonts/JetBrainsMono';
import {loadFont as loadPoppins} from '@remotion/google-fonts/Poppins';

const poppins = loadPoppins('normal', {weights: ['800'], subsets: ['latin', 'latin-ext']});
const inter = loadInter('normal', {weights: ['400', '700', '800'], subsets: ['latin', 'latin-ext']});

export const FONTS = {
	title: poppins.fontFamily,
	titleWeight: 800,
	body: inter.fontFamily,
} as const;

// Police à chasse fixe pour le code du style « Écran code » (non précisée dans STYLE.md).
export const CODE_FONT = loadJetBrainsMono('normal', {weights: ['500'], subsets: ['latin', 'latin-ext']}).fontFamily;
