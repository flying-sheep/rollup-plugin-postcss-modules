import { promises as fs } from 'fs'
import mkdirp from 'mkdirp'
import rmfr from 'rmfr'

import ava from 'ava'
import fixtures from 'ava-fixture'

import ts from 'typescript'

import { rollup } from 'rollup'
import { createRequire } from 'module'
import externalGlobals from 'rollup-plugin-external-globals'
import postcss from '../index.js'

const require = createRequire(import.meta.url);
const styleInjectPath = require
	.resolve('style-inject/dist/style-inject.es')
	.replace(/[\\/]+/g, '/')

const ftest = fixtures.default(ava, 'test/fixtures/cases', 'test/fixtures/expected', 'test/fixtures/results')

ftest.each(async (t, {
	casePath, baselinePath, resultPath, match
}) => {
	await rmfr(resultPath)
	await mkdirp(resultPath)

	const definition = `${baselinePath}/in.css.d.ts`
	if (await fs.stat(definition).catch(() => false)) {
		const prog = ts.createProgram([definition], {})
		const diagnostics = ts.getPreEmitDiagnostics(prog)
		if (diagnostics.length !== 0) {
			t.fail(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
				getCanonicalFileName: (path) => path,
				getCurrentDirectory: ts.sys.getCurrentDirectory,
				getNewLine: () => ts.sys.newLine
			}))
		}
	}

	const opts = (await import(`${casePath}/options.js`)).default
	const options = typeof opts === 'function' ? opts(resultPath) : opts

	const bundle = await rollup({
		input: `${casePath}/in.css`,
		output: { file: `${resultPath}/out.js` },
		plugins: [
			postcss(options),
			externalGlobals({ [styleInjectPath]: 'styleInject' }),
		],
	})

	await bundle.write({
		file: `${resultPath}/out.js`,
		format: 'es',
	})

	const dPath = `${casePath}/in.css.d.ts`
	if (await fs.stat(dPath).catch(() => false)) {
		fs.rename(dPath, `${resultPath}/in.css.d.ts`)
	}

	return match()
})
