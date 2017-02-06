#!/usr/bin/env node

var dir = __dirname;

var execSync = require('child_process').execSync
execSync('rm -rf ' + dir + '/gen');
execSync('mkdir -p ' + dir + '/gen/*');

require(dir + '/../../tools/node.js');

var executor = NodeModelExecutor.create({
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
