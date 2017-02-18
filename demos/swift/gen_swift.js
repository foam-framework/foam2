#!/usr/bin/env node

global.FOAM_FLAGS = {
  'node': true,
  'swift': true,
  'debug': true,
};

var execSync = require('child_process').execSync

var dir = __dirname;
var root = dir + '/../..';
var genDir = dir + '/MyPlayground.playground/Sources';

require(root + '/src/foam.js');
execSync('rm -rf ' + genDir);

var executor = foam.classloader.NodeJsModelExecutor.create({
  classpaths: [
    dir + '/../../src',
    dir + '/js',
  ],
  modelId: 'GenSwift',
  modelArgs: {
    models: [
      'Test',
    ],
    outdir: genDir,
  },
});
executor.execute().then(function() {
  var cmd = 'cp ' + root + '/swift_src/* ' + genDir + '/';
  execSync(cmd);
});
