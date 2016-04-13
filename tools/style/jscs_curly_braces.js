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

// Plugin to allow anything on a one-line if, for, etc. statement, not just a
// fixed set of keyworded expressions (return, continue, break).

/* globals require: false, module: false */

var assert = require('assert');

module.exports = function() {};

module.exports.prototype = {
  configure: function(options) {
    assert(options === true,
        this.getOptionName() + ' option requires true, or remove it');
  },
  getOptionName: function() {
    return 'foamRequireCurlyBraces';
  },

  check: function(file, errors) {
    function checkNodes(name, type, bodyKey) {
      file.iterateNodesByType(type, function(node) {
        var body = node[bodyKey];
        if ( ! body || body.type === 'BlockStatement' ) return;


        // We have a one-liner. Now lets check that the body's last token and
        // the whole statement's first token are on the same line.
        errors.assert.sameLine({
          token: file.getFirstNodeToken(node),
          nextToken: file.getLastNodeToken(body),
          message: name + ' statements must have { }s or be all on one line'
        });
      });
    }

    checkNodes('if', 'IfStatement', 'consequent');
    checkNodes('while', 'WhileStatement', 'body');
    checkNodes('for', 'ForStatement', 'body');
    checkNodes('for', 'ForInStatement', 'body');
    checkNodes('for', 'ForOfStatement', 'body');
  }
};

