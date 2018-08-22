#!/usr/bin/env node

var dir = __dirname;
var root = dir + '/../..';

require(root + '/src/foam.js');

var outDir = dir + '/build/src'
var srcDirs = [
  global.FOAM_ROOT,
  dir + '/src',
];

// Clear the destination dir.
var cp = require('child_process');
cp.execSync('rm -rf ' + outDir)
cp.execSync('mkdir -p ' + outDir)

foam.__context__.classloader.load('foam.build.Builder').then(function(cls) {
  cls.create({
    srcDirs: srcDirs,
    outDir: outDir,
    required: [
      'demo.build.ModelToBuild',
    ],
    flags: ['js', 'web'],
  }).execute();
});
