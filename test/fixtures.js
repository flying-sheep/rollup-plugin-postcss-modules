import { promises as fs } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import alias from '@rollup/plugin-alias'
import { baseline, Mismatch } from '@unional/fixture'
import ava from 'ava'
import { mkdirp } from 'mkdirp'
import rmfr from 'rmfr'
import { rollup } from 'rollup'
import ts from 'typescript'

import postcss from '../index.js'

const require = createRequire(import.meta.url)
const styleInjectPath = require
	.resolve('style-inject/dist/style-inject.es')
	.replace(/[\\/]+/g, '/')

const here = dirname(fileURLToPath(import.meta.url))

/** @type {import("@unional/fixture").BaselineHandler} */
const handler = ({ caseName, casePath, baselinePath, resultPath, match }) =>
	ava(caseName, async (t) => {
		await rmfr(resultPath)
		await mkdirp(resultPath)

		const definition = `${baselinePath}/in.css.d.ts`
		if (await fs.stat(definition).catch(() => false)) {
			const prog = ts.createProgram([definition], {})
			const diagnostics = ts.getPreEmitDiagnostics(prog)
			if (diagnostics.length !== 0) {
				t.fail(
					ts.formatDiagnosticsWithColorAndContext(diagnostics, {
						getCanonicalFileName: (path) => path,
						getCurrentDirectory: ts.sys.getCurrentDirectory,
						getNewLine: () => ts.sys.newLine,
					}),
				)
			}
		}

		const { default: opts } = await import(`${casePath}/options.js`)
		const options = typeof opts === 'function' ? opts(resultPath) : opts

		const bundle = await rollup({
			input: `${casePath}/in.css`,
			output: { file: `${resultPath}/out.js` },
			external: ['style-inject'],
			plugins: [
				postcss(options),
				alias({
					entries: { [styleInjectPath]: 'style-inject' },
				}),
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

		try {
			await match()
		} catch (e) {
			if (e instanceof Mismatch) t.fail(e.message)
			else throw e
		}
		t.pass()
	})

baseline(`${here}/fixtures`, handler)
