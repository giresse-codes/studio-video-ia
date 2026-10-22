import React from 'react';
import {Composition} from 'remotion';
import {ASTUCES_001_DEFAULTS, Astuces001, calculateAstuces001Metadata} from './compositions/astuces-001/Astuces001';
import {AVATAR_TEST_POSE_SECONDS, AVATAR_TEST_POSES, AvatarTest} from './compositions/AvatarTest';
import {calculateStyleTestMetadata, StyleTest, STYLE_TEST_DEFAULTS} from './compositions/style-test/StyleTest';
import {VIDEO} from './theme';

export const RemotionRoot: React.FC = () => (
	<>
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
		<Composition
			id="AvatarTest"
			component={AvatarTest}
			width={VIDEO.width}
			height={VIDEO.height}
			fps={VIDEO.fps}
			durationInFrames={AVATAR_TEST_POSES.length * AVATAR_TEST_POSE_SECONDS * VIDEO.fps}
			defaultProps={{side: 'droite' as const}}
		/>
		<Composition
			id="Astuces001"
			component={Astuces001}
			width={VIDEO.width}
			height={VIDEO.height}
			fps={VIDEO.fps}
			durationInFrames={VIDEO.fps * 55}
			defaultProps={ASTUCES_001_DEFAULTS}
			calculateMetadata={calculateAstuces001Metadata}
		/>
	</>
);
