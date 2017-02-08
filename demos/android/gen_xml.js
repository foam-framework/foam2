#!/usr/bin/env node

var dir = __dirname;
var root = dir + '/../..';

require(root + '/src/foam.js');
require(root + '/src/foam/classloader/OrDAO.js');
require(root + '/src/foam/classloader/NodeModelFileDAO.js');
require(root + '/src/foam/classloader/NodeJsModelExecutor.js');

var execSync = require('child_process').execSync
execSync('rm -rf ' + dir + '/gen');
execSync('mkdir -p ' + dir + '/gen');

var executor = foam.classloader.NodeJsModelExecutor.create({
  classpaths: [
    dir + '/../../src',
    dir + '/js'
  ],
  modelId: 'foam.android.GenStrings',
  modelArgs: {
    models: [
      'nodetooldemo.Test',
    ],
    outfile: dir + '/gen/strings.xml',
  },
});

foam.locale = 'en';
executor.execute().then(function() {
  foam.locale = 'fr';
  executor.modelArgs.outfile = dir + '/gen/strings-fr.xml';
  executor.execute();
})
