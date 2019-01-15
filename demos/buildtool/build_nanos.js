#!/usr/bin/env node

global.FOAM_FLAGS = {
  web: true,
  js: true,
  debug: true,
};

require(__dirname + '/../../src/foam.js');
require(__dirname + '/../../src/foam/nanos/nanos.js');

var deps = [
  'foam.build.Builder',
]

Promise.all(deps.map(d => foam.__context__.classloader.load(d))).then(function() {
  foam.build.Builder.create({
    targetFile: __dirname + '/foam-bin.js',
        enabledFeatures: ['web', 'js'],
  }).execute()
});
