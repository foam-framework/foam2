/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

if ( typeof RUNNING_IN_FOAMLINK !== 'undefined' )
  ABORT("This file is not a foamlink manifest");

const util = require('util');
var fs = require('fs');
var projRoot = process.cwd() + '/';

global.FOAM_FLAGS = {
  js: true,
  web: true,
  node: true,
  java: true,
  swift: true,
};

require(projRoot + 'foam3/src/foam.js');
require(projRoot + 'foam3/src/foam/nanos/nanos.js');
require(projRoot + 'foam3/src/foam/support/support.js');

function main () {
  if ( process.argv.length < 3 || typeof process.argv[2] !== 'string' ) {
    console.error(`Usage: node foamlink.js FILE_OUTPUT`);
    process.exit(1);
  }
  var args = process.argv.slice(2);
  var outputFile = args[0];

  var exe = foam.foamlink.FoamlinkExec.create();
  exe.exec().then(() => {
    console.log('DONE');
    exe.results.saveToDisk(outputFile);
  }).catch((e) => {
    console.error(e);
    console.log('\033[31;1mOh no! Foamlink aborted due to an error!\033[0m');
    process.exit(1);
  });
}

main();
