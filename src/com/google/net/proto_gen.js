/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

require('../../../foam');
require('./ProtobufParser');
var fs = require('fs');
var path = require('path');
/* globals process */

// Usage: output file is argv[2], input .proto files in argv[3+].
var parser = foam.lookup('com.google.net.ProtobufParser').create();

// Expects the input filename to be on the command line.
var outfile = process.argv[2];

var files = {};
for ( var i = 3 ; i < process.argv.length ; i++ ) {
  if ( process.argv[i].endsWith('.proto') ) {
    console.log(process.argv[i]);
    files[process.argv[i]] =
        parser.parseString(fs.readFileSync(process.argv[i]).toString());
  }
}

fs.writeFileSync(outfile, 'var FOAM_PROTOS = ' + JSON.stringify(files) + ';');
