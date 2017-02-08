#!/usr/bin/env node

var dir = __dirname;
var root = dir + '/../..';

require(root + '/src/foam.js');
require(root + '/src/foam/classloader/OrDAO.js');
require(root + '/src/foam/classloader/NodeModelFileDAO.js');
require(root + '/src/foam/classloader/NodeJsModelExecutor.js');

foam.locale = 'fr';

var executor = foam.classloader.NodeJsModelExecutor.create({
  classpaths: [
    dir + '/../../src',
    dir + '/js'
  ],
  modelId: 'nodetooldemo.Test',
  modelArgs: {
    name: 'Joe',
  },
});
executor.execute()
