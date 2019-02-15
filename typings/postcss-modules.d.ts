/* eslint import/no-extraneous-dependencies: 0 */

import { Plugin } from 'postcss'

declare namespace postcssModules {
	interface ExportTokens {
		[className: string]: string
	}
	interface PathFetcher {
		(file: string, relativeTo: string, depTrace: string): Promise<ExportTokens>
	}
	interface Loader {
		load: (source: string, sourcePath: string, pathFetcher: PathFetcher) =>
			Promise<{ injectableSource: string, exportTokens: ExportTokens }>
	}
	interface Options {
		/**
		 * By default, a JSON file with exported classes will be placed next to corresponding CSS.
		 * Use getJSON to do something else.
		 */
		getJSON?: (cssFileName: string, exportTokens: ExportTokens) => void | Promise<void>
		/** By default, the plugin assumes that all the classes are local */
		scopeBehaviour?: 'local' | 'global'
		/** Paths to global modules */
		globalModulePaths?: RegExp[]
		/** Function or interpolated string to create classes: https://github.com/webpack/loader-utils#interpolatename */
		generateScopedName?: ((name: string, filename: string, css: string) => string) | string
		/** Custom loader */
		Loader?: Loader
	}
}

declare const postcssModules: Plugin<postcssModules.Options>

export = postcssModules
