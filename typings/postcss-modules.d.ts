/* eslint import/no-extraneous-dependencies: 0 */

declare module 'postcss-modules' {
	import { Plugin } from 'postcss'
	
	export interface ExportTokens {
		[className: string]: string
	}
	export interface PathFetcher {
		(file: string, relativeTo: string, depTrace: string): Promise<ExportTokens>
	}
	export interface Loader {
		load: (source: string, sourcePath: string, pathFetcher: PathFetcher) =>
			Promise<{ injectableSource: string, exportTokens: ExportTokens }>
	}
	export interface Options {
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
	
	const postcssModules: Plugin<Options>
	export default postcssModules
}
