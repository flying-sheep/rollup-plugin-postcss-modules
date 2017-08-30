import fs from 'mz/fs'
import mkdirp from 'mkdirp-promise'
import rmfr from 'rmfr'

import ava from 'ava'
import fixture from 'ava-fixture'

import { rollup } from 'rollup'
import postcss from '..'

const ftest = fixture(ava, 'test/fixtures/cases', 'test/fixtures/expected', 'test/fixtures/results')

ftest.each(async (t, { casePath, resultPath, match }) => { try {
	await rmfr(resultPath)
	await mkdirp(resultPath)
	
	const opts = require(`${casePath}/options`)
	const options = typeof opts === 'function' ? opts(resultPath) : opts
	
	const plugin = await postcss(options)
	// prevent adding intro code but still execute for side effects
	const old_intro = plugin.intro
	plugin.intro = () => {
		old_intro()
		return null
	}
	
	const bundle = await rollup({
		entry: `${casePath}/in.css`,
		dest: `${resultPath}/out.js`,
		plugins: [plugin],
	})
	
	await bundle.write({
		dest: `${resultPath}/out.js`,
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
