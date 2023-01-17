import styleInject from 'style-inject';

var global = "global";
var local = "local";
var css_248z = ".global { color: blue } .local { color: red }\n";
var _in = {"global":"global","local":"local"};
var stylesheet=".global { color: blue } .local { color: red }\n";
styleInject(css_248z);

export { _in as default, global, local, stylesheet };
