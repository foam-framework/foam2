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

// Polyfill
if ( ! Object.assign ) Object.assign = function(obj, map) {
  if ( map )
    for ( var key in map )
      obj[key] = map[key];
}


// Setup nodejs-like 'global' on web
var global = global || this;


// Top-Level of foam package
foam = {
  Array:    Array.prototype,
  Function: Function.prototype,
  Number:   Number.prototype,
  Object:   Object.prototype,
  String:   String.prototype
};


foam.LIB = function LIB(model) {
  var proto;

  function defineProperty(proto, key, map) {
    if ( ! map.value || proto === Object.prototype || proto === Array.prototype )
      Object.defineProperty.apply(this, arguments);
    else
      proto[key] = map.value;
  }

  proto = foam[model.name] || ( foam[model.name] = {} );

  if ( model.properties ) for ( var i = 0 ; i < model.properties.length ; i++ ) {
    var p = model.properties[i];
    defineProperty(
      proto,
      p.name,
      { get: p.getter, enumerable: false });
  }

  for ( key in model.constants )
    defineProperty(
      proto,
      key,
      { value: model.constants[key], writable: true, enumerable: false });

  if ( model.methods ) for ( var i = 0 ; i < model.methods.length ; i++ ) {
    var m = model.methods[i];
    defineProperty(
      proto,
      m.name,
      { value: m.code || m, writable: true, enumerable: false });
  }
};


foam.LIB({
  name: 'Object',

  properties: [
    {
      name: '$UID',
      getter: (function() {
        var id = 1;
        return function() {
          if ( Object.hasOwnProperty.call(this, '$UID__') ) return this.$UID__;
          this.$UID__ = id;
          id++;
          return this.$UID__;
        };
      })()
    }
  ]
});


foam.LIB({
  name: 'Number',

  methods: [
    function compareTo(o) { return ( o == this ) ? 0 : this < o ? -1 : 1; },
  ]
});


foam.LIB({
  name: 'String',

  methods: [
    function compareTo(o) { return ( o == this ) ? 0 : this < o ? -1 : 1; },
  ]
});


foam.LIB({
  name: 'array',

  methods: [
    function argsToArray(args) {
      /** convenience method to turn 'arguments' into a real array */
      return foam.fn.appendArguments([], args, 0);
    }
  ]
});


foam.LIB({
  name: 'events',

  methods: [
    function oneTime(listener) {
      /** Create a "one-time" listener which unsubscribes itself after its first invocation. **/
      return function(subscription) {
        listener.apply(this, foam.array.argsToArray(arguments));
        subscription.destroy();
      };
    },

    function consoleLog(listener) {
      /** Log all listener invocations to console. **/
      return function() {
        var args = foam.array.argsToArray(arguments);
        console.log(args);
        listener.apply(this, args);
      };
    }
  ]
});


foam.LIB({
  name: 'fn',

  methods: [
    function memoize1(f) {
      // Faster version of memoize() when only dealing with one argument.
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
      // Set a function's name for improved debugging and profiling
      //Object.defineProperty(f, 'name', {value: name, configurable: true}); //TODO: re-enable if supported
    },

    function appendArguments(a, args, start) {
      /** convenience method to append 'arguments' onto a real array */
      for ( var i = start ; i < args.length ; i++ ) a.push(args[i]);
      return a;
    }
  ]
});


foam.LIB({
  name: 'string',

  methods: [
    {
      name: 'constantize',
      code: foam.fn.memoize1(function(str) {
        // switchFromCamelCaseToConstantFormat to SWITCH_FROM_CAMEL_CASE_TO_CONSTANT_FORMAT
        return str.replace(/[a-z][^0-9a-z_]/g, function(a) {
          return a.substring(0,1) + '_' + a.substring(1,2);
        }).toUpperCase();
      })
    },

    function pad(str, size) {
      // Right pads to size if size > 0, Left pads to -size if size < 0
      return size < 0 ?
        (new Array(-size).join(' ') + str).slice(size)       :
        (str + new Array(size).join(' ')).substring(0, size) ;
    }
  ]
});
