import fs from 'mz/fs'
import mkdirp from 'mkdirp-promise'
import rmfr from 'rmfr'

import ava from 'ava'
import fixture from 'ava-fixture'

import { rollup } from 'rollup'
import postcss from '..'

const styleInjectPath = require
	.resolve('style-inject/dist/style-inject.es')
	.replace(/[\\/]+/g, '/')
const ftest = fixture(ava, 'test/fixtures/cases', 'test/fixtures/expected', 'test/fixtures/results')

ftest.each(async (t, { casePath, resultPath, match }) => { try {
	await rmfr(resultPath)
	await mkdirp(resultPath)
	
	const opts = require(`${casePath}/options`)
	const options = typeof opts === 'function' ? opts(resultPath) : opts
	
	const bundle = await rollup({
		input: `${casePath}/in.css`,
		output: {
			file: `${resultPath}/out.js`,
			globals: { [styleInjectPath]: 'styleInject' },
		},
		external: [styleInjectPath],
		plugins: [await postcss(options)],
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
