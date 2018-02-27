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

/**
 * Top-Level of foam package
 */
foam = {
  isServer: typeof window === 'undefined',
  core:     {},
  next$UID: (function() {
    /* Return a unique id. */
    var id = 1;
    return function next$UID() { return id++; };
  })()
};


/** Setup nodejs-like 'global' on web */
if ( ! foam.isServer ) global = window;

global.SUPPRESSED_WARNINGS = global.SUPPRESSED_WARNINGS || {};
global.suppressWarnings = function (a) {

  a.forEach(function(key) {
    SUPPRESSED_WARNINGS[key] = true;
  })
}

suppressWarnings([ `Skipping constant PARSE_JSON with unknown type.`,
  `Property foam.core.FObjectProperty.of "value" hidden by "getter"`,
  `Unknown property foam.nanos.menu.DAOMenu.XXXsummaryView: [object Object]`,
  `Import "scriptDAO" already exists in ancestor class of foam.nanos.test.Test.`,
  `Unknown property foam.core.Model.javaType: foam.core.PropertyInfo`,
  `Property foam.dao.index.Index.nodeClass "factory" hidden by "getter"`
]);

Object.defineProperty(
  Object.prototype,
  '$UID',
  {
    get: function() {
      if ( ! Object.hasOwnProperty.call(this, '$UID__') &&
           ! Object.isFrozen(this) ) {
        Object.defineProperty(
            this,
            '$UID__',
            {value: foam.next$UID(), enumerable: false});
      }
      return this.$UID__;
    },
    enumerable: false
  }
);


/**
 * Define an assertion function that is significantly faster and more
 * compatible than console.assert.  Also allows us to turn off assertions
 * in a production scenario.
 *
 * Usage of console.assert directly is slow, and not all platforms agree
 * on what to do with extra arguments, some ignore them, some join them
 * to the message.
 */
foam.assert = function assert(cond) {
  if ( ! cond ) {
//    throw new Error(Array.from(arguments).slice(1).join(' '));
    console.assert(false, Array.from(arguments).slice(1).join(' '));

  }

  return cond;
};


/**
 * Creates a small library in the foam package. A LIB is a collection of
 * constants and static methods.
 * <pre>
foam.LIB({
  name: 'network',
  constants: {
    PORT: 4000
  },
  methods: [ function sendPacket() { ... }  ]
});
</pre>
Produces <code>foam.network</code>:
<pre>
console.log(foam.network.PORT); // outputs 4000
foam.network.sendPacket();
</pre>
 * @method LIB
 * @memberof module:foam
 */
foam.LIB = function LIB(model) {
  var root = global;
  var path = model.name.split('.');
  var i;

  for ( i = 0 ; i < path.length ; i++ ) {
    root = root[path[i]] || ( root[path[i]] = {} );
  }

  // During boot, keep a list of created LIBs
  if ( global.foam.__LIBS__ ) global.foam.__LIBS__[model.name] = root;

  if ( model.constants ) {
    foam.assert(
      typeof model.constants === 'object',
      'Constants must be a map.');

    for ( var key in model.constants ) root[key] = model.constants[key];
  }

  if ( model.methods ) {
    foam.assert(Array.isArray(model.methods), 'Methods must be an array.');

    for ( i = 0 ; i < model.methods.length ; i++ ) {
      var m = model.methods[i];

      foam.assert(
        typeof m === 'object' || typeof m === 'function',
        'Methods must be a map of a function');

      foam.assert(
         typeof m !== 'object' || typeof m.code === 'function',
        'Methods must have a code key which is a function');

      var name = m.name || foam.Function.getName(m);
      foam.assert(name, 'Methods must be named with a non-empty string');

      root[name] = m.code || m;
    }
  }
};
global.foam.__LIBS__ = {};
