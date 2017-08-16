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
    dir + '/../../src/com/google/foam/demos/tabata',
  ],
  modelId: 'foam.swift.GenSwift',
  modelArgs: {
    models: [
      // UI
      'foam.swift.ui.DetailView',
      'foam.swift.ui.FOAMUILabel',
      'foam.swift.ui.FOAMUITextField',
      'foam.swift.ui.FOAMUITextFieldInt',
      'foam.swift.ui.PropertyView',
      'foam.swift.ui.ScrollingViewController',
      'foam.u2.Visibility',

      'Tabata',
      'TestExtended',
      'TabataSoundView',
      'foam.swift.dao.ArrayDAO',
      'foam.swift.dao.ArraySink',
      'foam.swift.parse.StringPStream',
    ],
    outdir: genDir,
  },
});
executor.execute();
