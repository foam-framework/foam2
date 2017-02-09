#!/usr/bin/env node

var dir = __dirname;
var root = dir + '/../..';

require(root + '/src/foam.js');
require(root + '/src/foam/classloader/OrDAO.js');
require(root + '/src/foam/classloader/NodeModelFileDAO.js');
require(root + '/src/foam/classloader/NodeJsModelExecutor.js');
require(root + '/src/foam/swift/Refines.js');
require(root + '/src/foam/swift/Field.js');

var executor = foam.classloader.NodeJsModelExecutor.create({
  classpaths: [
    dir + '/../../src',
    dir + '/js',
  ],
  modelId: 'Test',
});
executor.execute()
