#!/usr/bin/env node

var dir = __dirname;
var root = dir + '/../..';

require(root + '/src/foam.js');

var outDir = dir + '/NANO_BUILD/src'
var srcDirs = [
  global.FOAM_ROOT
]

// Clear the destination dir.
var cp = require('child_process');
cp.execSync('rm -rf ' + outDir)
cp.execSync('mkdir -p ' + outDir)
srcDirs.forEach(function(srcDir) {
  cp.execSync(`rsync -a --exclude='*.js' --exclude='*.java' ${srcDir}/ ${outDir}/`)
});

foam.__context__.classloader.load('foam.build.Builder').then(function(cls) {
  cls.create({
    srcDirs: srcDirs,
    outDir: outDir,
  }).execute();
});
