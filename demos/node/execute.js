#!/usr/bin/env node

var dir = __dirname;
require(dir + '/../../tools/node.js');

foam.locale = 'fr';

var executor = NodeModelExecutor.create({
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
