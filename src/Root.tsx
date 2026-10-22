import React from 'react';
import {Composition} from 'remotion';
import {calculateStyleTestMetadata, StyleTest, STYLE_TEST_DEFAULTS} from './compositions/style-test/StyleTest';
import {VIDEO} from './theme';

export const RemotionRoot: React.FC = () => (
	<Composition
		id="StyleTest"
		component={StyleTest}
		width={VIDEO.width}
		height={VIDEO.height}
		fps={VIDEO.fps}
		durationInFrames={VIDEO.fps * 10}
		defaultProps={STYLE_TEST_DEFAULTS}
		calculateMetadata={calculateStyleTestMetadata}
	/>
);
