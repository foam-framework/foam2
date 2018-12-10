process.on('unhandledRejection', function(e) {
  console.error("ERROR: Unhandled promise rejection ", e);
  process.exit(1);
});

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

console.log("Requesting foo");
foam.__context__.classloader.load('test.Foo').then(function(c) {
  console.log("Trying to create one");
  c.create().refined_method();
});

foam.__context__.classloader.load('foam.nanos.auth.User').then(function(c) {
  console.log(c.create().stringify());
});
