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

// TODO(markdittmer): Get rid of special-casing of 'js' and 'nanos' flags.

var flags = {};
var otherLanguages = [ 'java', 'swift' ];

if ( process.argv.length > 2 ) {
  process.argv[2].split(',').forEach(function(f) {
    flags[f] = true;
  });

  // Default to language = javascript.
  if ( ! flags.js ) {
    flags.js = ! otherLanguages.some(function(lang) {
      return flags[lang];
    });
  }
}

var outfile = __dirname + '/../foam-bin.js';
if ( process.argv.length > 3 ) {
  outfile = process.argv[3];
}

var payload = '';
var env = {
  FOAM_FILES: function(files) {
    files.filter(function(f) {
      return f.flags ? flags[f.flags] : true;
    }).map(function(f) {
      return f.name;
    }).forEach(function(f) {
      var data = require('fs').readFileSync(__dirname + '/../src/' + f + '.js').toString();
      payload += data;
    });
  }
};

var data = [ require('fs').readFileSync(__dirname + '/../src/files.js') ];
if ( flags.nanos ) {
  data.push(
      require('fs').readFileSync(__dirname + '/../src/foam/nanos/nanos.js'));
}

if ( flags.support ) {
  data.push(
    require('fs').readFileSync(__dirname + '/../src/foam/support/support.js'));
}

for ( var i = 0; i < data.length; i++ ) {
  with (env) { eval(data[i].toString()); }
}
require('fs').writeFileSync(outfile, payload);
