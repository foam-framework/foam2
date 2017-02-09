#!/usr/bin/env node

global.FOAM_FLAGS = {
  'node': true,
  'swift': true,
  'debug': true,
};

var dir = __dirname;
var root = dir + '/../..';

require(root + '/src/foam.js');

var executor = foam.classloader.NodeJsModelExecutor.create({
  classpaths: [
    dir + '/../../src',
    dir + '/js',
  ],
  modelId: 'Test',
});
executor.execute()
