import fs from 'mz/fs'
import mkdirp from 'mkdirp-promise'
import rmfr from 'rmfr'

import ava from 'ava'
import fixture from 'ava-fixture'

import ts from 'typescript'
import format from 'ts-diagnostic-formatter'

import { rollup } from 'rollup'
import externalGlobals from 'rollup-plugin-external-globals'
import postcss from '..'

const styleInjectPath = require
	.resolve('style-inject/dist/style-inject.es')
	.replace(/[\\/]+/g, '/')
const ftest = fixture(ava, 'test/fixtures/cases', 'test/fixtures/expected', 'test/fixtures/results')

ftest.each(async (t, { casePath, baselinePath, resultPath, match }) => { try {
	await rmfr(resultPath)
	await mkdirp(resultPath)
	
	const definition = `${baselinePath}/in.css.d.ts`
	if (await fs.exists(definition)) {
		const parsed = ts.createSourceFile(
			definition,
			(await fs.readFile(definition)).toString(),
			ts.ScriptTarget.ES2015,
		)
		if (parsed.parseDiagnostics.length !== 0) {
			const prog = ts.createProgram([definition], {})
			const err = format(prog.getSyntacticDiagnostics(parsed), 'codeframe')[0]
			t.fail(`Syntax error in ${err.file}\n${err.message}`)
		}
	}
	
	const opts = require(`${casePath}/options`)
	const options = typeof opts === 'function' ? opts(resultPath) : opts
	
	const bundle = await rollup({
		input: `${casePath}/in.css`,
		output: { file: `${resultPath}/out.js` },
		plugins: [
			await postcss(options),
			externalGlobals({ [styleInjectPath]: 'styleInject' }),
		],
	})
	
	await bundle.write({
		file: `${resultPath}/out.js`,
		format: 'es',
	})
	
	const dPath = `${casePath}/in.css.d.ts`
	if (await fs.exists(dPath)) {
		fs.rename(dPath, `${resultPath}/in.css.d.ts`)
	}
	
	return match()
} catch (e) {
	console.error(e.stack)
	throw e
}})
