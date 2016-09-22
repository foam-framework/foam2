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

global.DEBUG = global.DEBUG || false;

if ( ! typeof performance !== 'undefined' ) performance = {
  now: function() { return Date.now(); }
};


foam.LIB({
  name: 'foam.async',

  methods: [
    function atime(name, fn) {
      var startTime;
      var fn1 = function() {
        startTime = performance.now();
      }
      var fn2 = function(arg) {
        var endTime = performance.now();
        console.log(name.replace(/\,/g, ';'), ", ", endTime - startTime);
        return arg;
      };
      return foam.async.sequence([ fn1, fn, fn2 ]);
    },

    function atest(name, fn) {
      var fn1 = function() {
        if ( DEBUG ) console.log("Starting:", name);
      }
      return foam.async.sequence([ fn1, foam.async.atime(name, fn) ]);
    },

    function atestSelect(name, fn) {
      var fn1 = function() {
        if ( DEBUG ) console.log("Starting:", name);
      }
      var fn2 = function(arg) {
        if ( DEBUG ) console.log(name, 'result size: ', arg.a.length);
      };
      return foam.async.sequence([ fn1, foam.async.atime(name, fn), fn2 ]);
    }
  ]
})
