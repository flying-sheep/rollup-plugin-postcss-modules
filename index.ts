import { promises as fs } from 'fs'
import * as path from 'path'

import camelcase from 'camelcase'
import postcss, { PostCSSPluginConf } from 'rollup-plugin-postcss'
import * as postcssModules from 'postcss-modules'
import reserved from 'reserved-words'
import type { Plugin } from 'rollup'
import type { Transformer } from 'postcss'

function fixname(name: string) {
	const ccName = camelcase(name)
	return reserved.check(ccName) ? `$${ccName}$` : ccName
}

const formatCSSDefinition = (name: string, classNames: string[]) => `\
${classNames.filter((n) => !/-/.test(n)).map((t) => `export const ${t}: string`).join('\n')}
interface Namespace {
	${classNames.map((t) => `${JSON.stringify(t)}: string,`).join('\n\t')}
}
declare const ${name}: Namespace
export default ${name}`

async function writeCSSDefinition(cssPath: string, classNames: string[]): Promise<string> {
	const name = fixname(path.basename(cssPath, '.css'))
	const definition = formatCSSDefinition(name, classNames)
	const dPath = `${cssPath}.d.ts`
	await fs.writeFile(dPath, `${definition}\n`)
	return dPath
}

export type DefinitionCB = (dPath: string) => void | PromiseLike<void>

type PostcssOptions = Parameters<postcssModules>[0]
type PostcssModulesTokens = Parameters<NonNullable<PostcssOptions['getJSON']>>[1]

class CSSExports {
	writeDefinitions: boolean | DefinitionCB
	exports: { [moduleName: string]: PostcssModulesTokens }
	
	constructor(writeDefinitions: boolean | DefinitionCB) {
		this.writeDefinitions = writeDefinitions
	}
	
	definitionCB = async (dPath: string) => {
		if (typeof this.writeDefinitions === 'function') {
			await Promise.resolve(this.writeDefinitions(dPath))
		} else {
			console.log(`${dPath} written`)
		}
	}
	
	getJSON = async (id: string, exportTokens: PostcssModulesTokens) => {
		const ccTokens: PostcssModulesTokens = {}
		for (const className of Object.keys(exportTokens)) {
			ccTokens[fixname(className)] = exportTokens[className]
			ccTokens[className] = exportTokens[className]
		}
		if (this.writeDefinitions) {
			const dPath = await writeCSSDefinition(id, Object.keys(ccTokens))
			await this.definitionCB(dPath)
		}
	}
}

export interface Options extends PostCSSPluginConf {
	/** Write typescript definitions next to source files? Default: false */
	writeDefinitions?: boolean | DefinitionCB
}

export default function eslintPluginPostCSSModules(options: Options = {}): Plugin {
	const {
		plugins = [],
		// own options
		writeDefinitions = false,
		modules = {},
		namedExports = fixname,
		...rest
	} = options
	if ('getExport' in rest) {
		throw new Error("'getExport' is no longer supported.")
	}
	if (plugins.some((p) => (p as Transformer).postcssPlugin === 'postcss-modules')) {
		throw new Error("'rollup-plugin-postcss-modules' provides a 'postcss-modules' plugin, you cannot specify your own. Use the `modules` config key for configuration.")
	}
	const modulesOptions = modules === true ? {} : modules
	if (modulesOptions === false || modulesOptions.getJSON) {
		throw new Error("'rollup-plugin-postcss-modules' provides a 'postcss-modules' plugin and its `getJSON()`. You cannot specify `modules.getJSON`")
	}
	
	const { getJSON } = new CSSExports(writeDefinitions)

	return postcss({
		plugins: [...plugins],
		modules: { getJSON, ...modulesOptions },
		autoModules: false,
		namedExports,
		...rest,
	})
}
