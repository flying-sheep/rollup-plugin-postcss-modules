import * as fs from 'fs'
import * as path from 'path'

import * as camelcase from 'camelcase'
import * as postcss from 'rollup-plugin-postcss'
import * as postcssModules from 'postcss-modules'

export const formatCSSDefinition = (name: string, classNames: string[]) => `\
declare namespace ${name} {
	${classNames.map(t => `const ${t}: string`).join('\n\t')}
}
export default ${name}`

export function writeCSSDefinition(cssPath: string, classNames: string[]): Promise<string> {
	const name = camelcase(path.basename(cssPath, '.css'))
	const definition = formatCSSDefinition(name, classNames)
	const dPath = `${cssPath}.d.ts`
	return new Promise((resolve, reject) => {
		fs.writeFile(dPath, `${definition}\n`, e => (e ? reject(e) : resolve(dPath)))
	})
}

export class CSSExports {
	writeDefinitions: boolean | ((dPath: string) => void)
	exports: { [moduleName: string]: postcssModules.ExportTokens }

	constructor(writeDefinitions: boolean | ((dPath: string) => void)) {
		this.writeDefinitions = writeDefinitions
		this.exports = {}
	}
	
	definitionCB = (dPath: string) => {
		if (typeof this.writeDefinitions === 'function') {
			this.writeDefinitions(dPath)
		} else {
			console.log(`${dPath} written`)
		}
	}
	
	getJSON = (id: string, exportTokens: postcssModules.ExportTokens) => {
		if (this.writeDefinitions) {
			writeCSSDefinition(id, Object.keys(exportTokens))
				.then(this.definitionCB)
		}
		this.exports[id] = exportTokens
	}
	
	getExport = (id: string) => this.exports[id]
}

export interface Options extends postcss.Options {
	writeDefinitions?: boolean | ((dPath: string) => void)
	postcssModulesOptions?: postcssModules.Options
}

export default function eslintPluginPostCSSModules(options: Options) {
	const {
		plugins = [],
		// own options
		writeDefinitions = false,
		postcssModulesOptions = {},
		...rest,
	} = options
	if (rest.getExport) {
		throw new Error("rollup-plugin-postcss-modules' provides getExport, you cannot specify your own.")
	}
	if (plugins.some(p => p.postcssPlugin === 'postcss-modules')) {
		throw new Error("'rollup-plugin-postcss-modules' provides a 'postcss-modules' plugin, you cannot specify your own. Use `postcssModulesOptions` for configuration.")
	}
	if (postcssModulesOptions.getJSON) {
		throw new Error("'rollup-plugin-postcss-modules' provides a 'postcss-modules' plugin and provides its `getJSON()`. You cannot specify `postcssModulesOptions.getJSON`.")
	}

	const { getExport, getJSON } = new CSSExports(writeDefinitions)

	const postcssModulesPlugin = postcssModules({ getJSON, ...postcssModulesOptions })

	return postcss({
		plugins: [postcssModulesPlugin, ...plugins],
		getExport,
		...rest,
	})
}
