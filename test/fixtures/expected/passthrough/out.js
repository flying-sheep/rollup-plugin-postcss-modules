import styleInject from 'style-inject';

var test = "test";
var css_248z = ".test { color: blue }\n";
var _in = {"test":"test"};
var stylesheet=".test { color: blue }\n";
styleInject(css_248z);

export { _in as default, stylesheet, test };
