import type {WebpackOverrideFn} from '@remotion/bundler';

// Les scripts Markdown (channels/<chaine>/scripts/) s'importent comme du texte.
export const webpackOverride: WebpackOverrideFn = (config) => ({
	...config,
	module: {
		...config.module,
		rules: [...(config.module?.rules ?? []), {test: /\.md$/, type: 'asset/source'}],
	},
});
