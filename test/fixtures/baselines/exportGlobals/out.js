import styleInject from 'style-inject';

var global = "global";
var local = "local";
var css_248z = ".global {\n  color: blue;\n}\n.local {\n  color: red;\n}\n";
var _in = {"global":"global","local":"local"};
var stylesheet=".global {\n  color: blue;\n}\n.local {\n  color: red;\n}\n";
styleInject(css_248z);

export { _in as default, global, local, stylesheet };
