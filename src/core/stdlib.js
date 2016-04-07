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

/**
 * Top-Level of foam package
 */
foam = {
  isServer: typeof process === 'object',
  core:     {},
  Array:    Array.prototype,
  Function: Function.prototype,
  Number:   Number.prototype,
  next$UID: (function() {
    /* Return a unique id. */
    var id = 1;
    return function next$UID() {
      return id++;
    }
  })()
};

/** Setup nodejs-like 'global' on web */
if ( ! foam.isServer ) global = this;

Object.defineProperty(
  Object.prototype,
  '$UID',
  {
    get: function() {
      if ( Object.hasOwnProperty.call(this, '$UID__') ) return this.$UID__;
      Object.defineProperty(this, '$UID__', {value: foam.next$UID(), enumerable: false});
      return this.$UID__;
    },
    enumerable: false
  }
);


/**
 * Creates a small library in the foam package. A LIB is a collection of static constants,
 * properties, methods and functions. It can also add properties to a core javascript
 * object when you specify name: 'Array', 'Function', 'Number', 'Object',
 * 'String', or 'Date'.
 * <pre>
foam.LIB({
  name: 'network',
  properties: [ { name: 'packets' } ],
  methods: [ function sendPacket() { ... }  ]
});
</pre>
Produces <code>foam.network</code>:
<pre>
foam.network.packets = 4;
foam.network.sendPacket();
</pre>
Or add methods and properties to built-in types (avoid this usage if you can):
<pre>
foam.LIB({
  name: 'Number',
  methods: [ function plusOne() { this += 1; } ]
});
console.assert(9.plusOne() == 10, "It works!");
</pre>
 * @method LIB
 * @memberof module:foam
 */
foam.LIB = function LIB(model) {
  function defineProperty(proto, key, map) {
    if ( ! map.value || proto === Object.prototype || proto === Array.prototype )
      Object.defineProperty.apply(this, arguments);
    else
      proto[key] = map.value;
  }

  var proto = model.name ? foam[model.name] || ( foam[model.name] = {} ) : foam;

  if ( model.constants ) {
    console.assert(
      typeof model.constants === 'object' && ! Array.isArray(model.properties),
      'Constants must be a map.');

    for ( var key in model.constants )
      defineProperty(
        proto,
        key,
        { value: model.constants[key], writable: true, enumerable: false });
  }

  if ( model.methods ) {
    console.assert(Array.isArray(model.methods), 'Methods must be an array.');

    for ( var i = 0 ; i < model.methods.length ; i++ ) {
      var m = model.methods[i];
      defineProperty(
        proto,
        m.name,
        { value: m.code || m, writable: true, enumerable: false });
    }
  }
};


foam.LIB({
  name: 'fn',

  methods: [
    function bind(f, that, a1, a2, a3, a4) {
      switch ( arguments.length ) {
        case 2: return function() { return f.apply(that, arguments); };
        case 3: return function(b1, b2, b3, b4) {
          switch ( arguments.length ) {
            case 0: return f.call(that, a1);
            case 1: return f.call(that, a1, b1);
            case 2: return f.call(that, a1, b1, b2);
            case 3: return f.call(that, a1, b1, b2, b3);
            case 4: return f.call(that, a1, b1, b2, b3, b4);
          }
        };
        case 4: return function(b1, b2, b3, b4) {
          switch ( arguments.length ) {
            case 0: return f.call(that, a1, a2);
            case 1: return f.call(that, a1, a2, b1);
            case 2: return f.call(that, a1, a2, b1, b2);
            case 3: return f.call(that, a1, a2, b1, b2, b3);
            case 4: return f.call(that, a1, a2, b1, b2, b3, b4);
          }
        };
        case 5: return function(b1, b2, b3, b4) {
          switch ( arguments.length ) {
            case 0: return f.call(that, a1, a2, a3);
            case 1: return f.call(that, a1, a2, a3, b1);
            case 2: return f.call(that, a1, a2, a3, b1, b2);
            case 3: return f.call(that, a1, a2, a3, b1, b2, b3);
            case 4: return f.call(that, a1, a2, a3, b1, b2, b3, b4);
          }
        };
        case 6: return function(b1, b2, b3, b4) {
          switch ( arguments.length ) {
            case 0: return f.call(that, a1, a2, a3, a4);
            case 1: return f.call(that, a1, a2, a3, a4, b1);
            case 2: return f.call(that, a1, a2, a3, a4, b1, b2);
            case 3: return f.call(that, a1, a2, a3, a4, b1, b2, b3);
            case 4: return f.call(that, a1, a2, a3, a4, b1, b2, b3, b4);
          }
        };
      }
      console.error('Attempt to foam.fn.bind more than 4 arguments.');
    }
  ]
});


foam.LIB({
  name: 'math',

  methods: [
    function distance(x, y) { return Math.sqrt(x*x + y*y); }
  ]
});


/** Array prototype additions. */
foam.LIB({
  name: 'Array',

  methods: [
    function diff(other) {
      /** Finds elements added (found in other, not in this) and removed
          (found in this, not in other). Repeated values are treated
          as separate elements, but ordering changes are ignored. */
      var added = other.slice(0);
      var removed = [];
      for ( var i = 0 ; i < this.length ; i++ ) {
        for ( var j = 0 ; j < added.length ; j++ ) {
          if ( foam.compare.compare(this[i], added[j]) == 0 ) {
            added.splice(j, 1);
            j--;
            break;
          }
        }
        if ( j == added.length ) removed.push(this[i]);
      }
      return { added: added, removed: removed };
    },
    function clone() {
      /** Returns a deep copy of this array and its contents. */
      var ret = new Array(this.length);
      for ( var i = 0 ; i < this.length ; i++ ) {
        ret[i] = (  this[i] && this[i].clone ) ? this[i].clone() : this[i];
      }
      return ret;
    }
  ]
});
