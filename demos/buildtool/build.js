#!/usr/bin/env node

var dir = __dirname;
var root = dir + '/../..';
console.log(`dir = ${dir} and root = ${root}`);

require(root + '/src/foam.js');

var classloader = foam.__context__.classloader;


classloader.addClassPath(dir + '/src');

classloader.load('foam.tools.Build').then(function() {
  var b = foam.tools.Build.create({
    modelId: 'demo.build.ModelToBuild',
    root: dir + '/build/',
  });
  b.execute();
});
