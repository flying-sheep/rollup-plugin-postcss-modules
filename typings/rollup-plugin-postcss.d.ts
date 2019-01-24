/* eslint import/no-extraneous-dependencies: 0 */

import { Plugin } from 'rollup'
import { AcceptedPlugin, Parse, Syntax } from 'postcss'
import * as postcssModules from 'postcss-modules'

declare namespace rollupPostcss {
	// eslint-disable-next-line import/prefer-default-export
	export interface Options {
		/** Array of postcss plugins to use. Default: none */
		plugins?: AcceptedPlugin[]
		/** create a source map? Default: false */
		sourceMap?: boolean
		/** Inject CSS into `<head>`, it's always false when `extract: true`. */
		inject?: boolean | { insertAt?: 'top' }
		/**
		 * If true, extract to the same name as Rollup’s dest (with a .css suffix).
		 * Alternatively provide a path or do not extract (The default: false)
		 */
		extract?: boolean | string
		/** When injecting CSS (!extract), should only one `<style/>` tag be created? Default: false */
		combineStyleTags?: boolean
		/** Accepted extension to try and parse. Default: .css and .sss */
		extensions?: string[]
		/**
		 * Function that accepts a input CSS filename and returns
		 * a mapping from class name to scoped name.
		 */
		getExport?: (id: string) => { [className: string]: string }
		/** Options for postcss-modules. */
		modules?: boolean | postcssModules.Options
		/** Custom CSS parser. */
		parser?: Parse | Syntax
		/** CSS preprocessor for alternative syntaxes like Stylus and Sass. */
		preprocessor?: (content: string, id: string) => Promise<{code: string, map: any}>
	}
}

declare function rollupPostcss(options: rollupPostcss.Options): Promise<Plugin>

export = rollupPostcss
