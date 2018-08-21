#!/usr/bin/env node

var dir = __dirname;
var root = dir + '/../..';

require(root + '/src/foam.js');

foam.__context__.classloader.load('foam.build.Builder').then(function(cls) {
  cls.create({
    srcDirs: [
      global.FOAM_ROOT,
      dir + '/src',
    ],
    outDir: dir + '/build/src',
    required: [
      'demo.build.ModelToBuild',
    ],
    flags: ['js', 'web'],
  }).execute();
});
