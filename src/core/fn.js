/*
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

foam.LIB({
  name: 'foam.fn',

  methods: [
    /** Faster version of memoize() when only dealing with one argument. */
    function memoize1(f) {
      var cache = {};
      var g = function(arg) {
        console.assert(arguments.length == 1, "Memoize1'ed functions must take exactly one argument.");
        var key = arg ? arg.toString() : '';
        if ( ! cache.hasOwnProperty(key) ) cache[key] = f.call(this, arg);
        return cache[key];
      };
      foam.fn.setName(g, 'memoize1(' + f.name + ')');
      return g;
    },

    function setName(f, name) {
      /** Set a function's name for improved debugging and profiling **/
      Object.defineProperty(f, 'name', {value: name, configurable: true});
    },

    function appendArguments(a, args, start) {
      /** Convenience method to append 'arguments' onto a real array **/
      for ( var i = start ; i < args.length ; i++ ) a.push(args[i]);
      return a;
    },

    function argsStr(f) {
      /** Finds the function(...) declaration arguments part. Strips newlines. */
      return f.toString().replace(/(\r\n|\n|\r)/gm,"").match(/^function(\s+[_$\w]+|\s*)\((.*?)\)/)[2] || '';
    },

    function argsArray(f) {
      /**
       * Return a function's arguments as an array.
       * Ex. args(function(a,b) {...}) == ['a', 'b']
       **/
      var args = foam.fn.argsStr(f);
      if ( ! args ) return [];
      args += ',';

      var ret = [];
      // [ ws /* anything */ ] ws arg_name ws [ /* anything */ ],
      var argMatcher = /(\s*\/\*.*?\*\/)?\s*([\w_$]+)\s*(\/\*.*?\*\/)?\s*\,+/g;
      var typeMatch;
      while ((typeMatch = argMatcher.exec(args)) !== null) {
        ret.push(typeMatch[2]);
      }
      return ret;
    }
  ]
});

(function() {
  // Disable setName if not supported on this platform.
  try {
    foam.fn.setName(function() {}, '');
  } catch (x) {
    /**
      @class fn
      @ignore */
    foam.LIB({
      name: 'foam.fn',
      methods: [ function setName() { /* NOP */ } ]
    });
  }
})();
