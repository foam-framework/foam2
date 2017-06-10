/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

//
// Top-level script for instantiating a new foam.box.node.ServerBox.
// The caller sends a FON description of the desired server over stdin,
// then closes stdin. At that point, this script instantiates and starts the
// server.
//

var sep = require('path').sep;
require(`${__dirname}${sep}..${sep}..${sep}..${sep}foam.js`);

var stdin = require('process').stdin;
var buf = '';
stdin.on('data', function(data) {
  console.info('Received server spec part', JSON.stringify(data.toString()));
  buf += data.toString();
});
stdin.on('end', function() {
  console.info('Starting server spec', JSON.stringify(buf, null, 2));
  // TODO(markdittmer): Use secure parser.
  foam.json.parseString(buf, foam.box.Context.create()).start();
});
