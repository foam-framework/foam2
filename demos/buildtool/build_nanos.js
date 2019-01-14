#!/usr/bin/env node

global.FOAM_FLAGS = {
  web: true,
  js: true,
  debug: true,
};

require(__dirname + '/../../src/foam.js');

foam.__context__.classloader.addClassPath(__dirname + '/src');

Promise.all([
  foam.__context__.classloader.load('foam.build.Builder'),
  foam.__context__.classloader.load('foam.nanos.controller.ApplicationController'),
]).then(function(cls) {
  foam.build.Builder.create({
    targetFile: dir + '/foam-bin.js'
  }).execute()
});
