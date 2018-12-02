global.FOAM_FLAGS = {
  node: true,
  web: false,
  js: true,
  java: true,
  swift: false,
  debug: true
};

require('./foam-bin.js');
require('./modeldao.js');

foam.__context__.classloader.load('test.Foo').then(function(c) {
  c.create().refined_method();
});
