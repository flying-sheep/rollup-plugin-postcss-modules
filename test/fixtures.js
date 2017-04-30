import mkdirp from 'mkdirp-promise'
import rmfr from 'rmfr'

import ava from 'ava'
import fixture from 'ava-fixture'

import { rollup } from 'rollup'
import postcss from '..'

const ftest = fixture(ava, 'test/fixtures/cases', 'test/fixtures/expected', 'test/fixtures/results')

ftest.each(async (t, { casePath, resultPath, match }) => {
	await rmfr(resultPath)
	await mkdirp(resultPath)

	const opts = require(`${casePath}/options`)
	const options = typeof opts === 'function' ? opts(resultPath) : opts

	const plugin = await postcss(options)
	plugin.intro = () => {}

	const bundle = await rollup({
		entry: `${casePath}/in.css`,
		dest: `${resultPath}/out.js`,
		plugins: [plugin],
	})

	await bundle.write({
		dest: `${resultPath}/out.js`,
		format: 'es',
	})

	return match()
})
