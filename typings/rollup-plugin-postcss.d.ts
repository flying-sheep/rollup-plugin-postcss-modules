/* eslint import/no-extraneous-dependencies: 0 */

import { Transformer } from 'postcss'

declare namespace rollupPostcss {
	export interface Options {
		plugins?: Transformer[]
		getExport?: (id: string) => { [className: string]: string }
		[name: string]: any // TODO
	}
}

declare function rollupPostcss(options: rollupPostcss.Options): Promise<any>

export = rollupPostcss
