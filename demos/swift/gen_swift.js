#!/usr/bin/env node

global.FOAM_FLAGS = {
  'node': true,
  'swift': true,
  'debug': true,
};

var execSync = require('child_process').execSync

var dir = __dirname;
var root = dir + '/../..';
var genDir = dir + '/gen';

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
      'TestExtended',
      'somepackage.RequiredClass',
      'foam.swift.ui.FOAMUILabel',
      'foam.swift.ui.FOAMUITextField',
      'foam.swift.ui.DetailView',
      'foam.swift.ui.FOAMActionUIButton',
    ],
    outdir: genDir,
  },
});
executor.execute();
