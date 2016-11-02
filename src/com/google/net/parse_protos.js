require('../../../foam');
require('./ProtobufParser');
var fs = require('fs');
var path = require('path');
/* globals process */

// Usage: output JSON file is argv[2], input .proto files in argv[3+].
var parser = foam.lookup('com.google.net.ProtobufParser').create();

// Expects the input filename to be on the command line.
var outfile = process.argv[2];

var contents = '';
for ( var i = 3 ; i < process.argv.length ; i++ ) {
  contents += fs.readFileSync(process.argv[i]).toString();
}

var parsed = parser.parseString(contents);
fs.writeFileSync(outfile, JSON.stringify(parsed));

