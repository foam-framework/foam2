if ( typeof RUNNING_IN_FOAMLINK !== 'undefined' )
  ABORT("this file is not a foamlink manifest");

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

require(projRoot + 'foam2/src/foam.js');
require(projRoot + 'foam2/src/foam/nanos/nanos.js');
require(projRoot + 'foam2/src/foam/support/support.js');

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

  /*
    var walker = foam.foamlink.FileWalker.create();
    walker.files.sub((_1, _2, info) => {
      var foamlink = null;
      if ( info.files.hasOwnProperty('foamlink.js') ) {
        foamlink = info.files['foamlink.js'];
      }
    });
    walker.walk('./deployment').then(() => {
      return;
      let o = foam.json.Outputter.create();
      let cls = foam.lookup('foam.foamlink.FileWalker');
      let r = o.objectify(cls.model_);
      let s = JSON.stringify(r);
      let hurledUpModel = JSON.parse(s);
      let realModel = foam.lookup(
        hurledUpModel.class || 'Model').create(hurledUpModel);
      let newCls = realModel.buildClass();
      console.log(newCls.id)
    });;
  */
}

main();
