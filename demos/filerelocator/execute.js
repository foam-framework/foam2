#!/usr/bin/env node

var dir = __dirname;
var root = dir + '/../..';

require(root + '/src/foam.js');

var executor = foam.classloader.NodeJsModelExecutor.create({
  classpaths: [
    root + '/src',
    dir + '/src',
  ],
  modelId: 'foam.tools.FileRelocator',
  modelArgs: {
    outputPath: dir + '/OUTPUT/',
    filePath: root + '/src/foam/u2/Element.js',
    defaultPackage: 'foam.u2',
  },
});
executor.execute()
