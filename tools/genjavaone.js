/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

process.on('unhandledRejection', function(e) {
  console.error("ERROR: Unhandled promise rejection ", e);
  process.exit(1);
});

// enable FOAM java support.
global.FOAM_FLAGS = { 'java': true, 'debug': true, 'js': false };

require('../src/foam.js');
require('../src/foam/nanos/nanos.js');

if ( process.argv.length != 4 ) {
  console.log("USAGE: genjavaone.js model-id output-path");
  process.exit(1);
}

var path_ = require('path');
var fs_ = require('fs');

var outdir = process.argv[3];
outdir = path_.resolve(path_.normalize(outdir));

function ensurePath(p) {
  var i = 1 ;
  var parts = p.split(path_.sep);
  var path = '/' + parts[0];

  while ( i < parts.length ) {
    try {
      var stat = fs_.statSync(path);
      if ( ! stat.isDirectory() ) throw path + 'is not a directory';
    } catch(e) {
      fs_.mkdirSync(path);
    }

    path += path_.sep + parts[i++];
  }
}

function generateClass(cls) {
  if ( foam.Array.isInstance(cls) ) {
    cls = cls[1];
  }
  if ( typeof cls === 'string' )
    cls = foam.lookup(cls);

  var outfile = outdir + path_.sep +
    cls.id.replace(/\./g, path_.sep) + '.java';

  ensurePath(outfile);

  require('fs').writeFileSync(outfile, cls.buildJavaClass().toJavaSource(), 'utf8');
}

foam.__context__.classloader.load(process.argv[2]).then(function(cls) {
  generateClass(cls);
});
