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

var flags = {};

if ( process.argv.length > 2 ) {
  process.argv[2].split(',').forEach(function(f) {
    flags[f] = true;
  });
}

var env = {
  FOAM_FILES: function(files) {
    var payload = '';

    files.filter(function(f) {
      return f.flags ? flags[f.flags] : true;
    }).map(function(f) {
      return f.name;
    }).forEach(function(f) {
      var data = require('fs').readFileSync(__dirname + '/../src/' + f + '.js').toString();
      payload += data;
    });

    require('fs').writeFileSync(__dirname + '/../foam-bin.js', payload);
  }
};

var data = require('fs').readFileSync(__dirname + '/../src/files.js');

with (env) { eval(data.toString()); }
