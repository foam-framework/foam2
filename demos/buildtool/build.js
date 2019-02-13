#!/usr/bin/env node

global.FOAM_FLAGS = {
  web: true,
  js: true,
  debug: true,
};

require(__dirname + '/../../src/foam.js');

foam.__context__.classloader.addClassPath(__dirname + '/src');

Promise.all([
  foam.__context__.classloader.load('foam.build.Builder'),
  foam.__context__.classloader.load('demo.build.ModelToBuild'),
]).then(function(cls) {
  foam.build.Builder.create({
    targetFile: __dirname + '/foam-bin.js',
    enabledFeatures: ['web', 'js'],
  }).execute()
});
