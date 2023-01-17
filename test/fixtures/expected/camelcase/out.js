import styleInject from 'style-inject';

var testCls = "test-cls";
var css_248z = ".test-cls { color: blue }\n";
var _in = {"test-cls":"test-cls","testCls":"test-cls"};
var stylesheet=".test-cls { color: blue }\n";
styleInject(css_248z);

export { _in as default, stylesheet, testCls };
