import styleInject from 'style-inject'

var test = 'test'
var css_248z = '.test {\n  color: blue;\n}\n'
var _in = { test: 'test' }
var stylesheet = '.test {\n  color: blue;\n}\n'
styleInject(css_248z)

export { _in as default, stylesheet, test }
