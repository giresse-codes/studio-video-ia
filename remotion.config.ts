import {Config} from '@remotion/cli/config';
import {webpackOverride} from './src/webpack-override';

Config.setEntryPoint('src/index.ts');
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.overrideWebpackConfig(webpackOverride);
