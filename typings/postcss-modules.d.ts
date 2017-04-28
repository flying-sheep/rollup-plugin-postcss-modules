/* eslint import/no-extraneous-dependencies: 0 */

import { Plugin } from 'postcss'

declare namespace postcssModules {
	interface ExportTokens {
		[className: string]: string
	}
	interface Options {
		getJSON?: (id: string, exportTokens: ExportTokens) => void
		[name: string]: any  // TODO
	}
}

declare const postcssModules: Plugin<postcssModules.Options>

export = postcssModules
