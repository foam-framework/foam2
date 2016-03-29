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
  String:   String.prototype,
  Date:     Date.prototype
};

/** Setup nodejs-like 'global' on web */
if ( ! foam.isServer ) global = this;

Object.defineProperty(
  Object.prototype,
  '$UID',
  {
    get: (function() {
      var id = 1;
      return function() {
        if ( Object.hasOwnProperty.call(this, '$UID__') ) return this.$UID__;
        Object.defineProperty(this, '$UID__', {value: id, enumerable: false});
        id++;
        return this.$UID__;
      };
    })(),
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


/** Number prototype additions. */
foam.LIB({
  name: 'Number',

  methods: [
    function compareTo(o) { return ( o == this ) ? 0 : this < o ? -1 : 1; },
  ]
});


/** String prototype additions. */
foam.LIB({
  name: 'String',

  methods: [
    function compareTo(o) { return ( o == this ) ? 0 : this < o ? -1 : 1; },

    /** Adds hashCode functionality to all strings. */
    function hashCode() {
      var hash = 0;
      if ( this.length == 0 ) return hash;

      for ( i = 0 ; i < this.length ; i++ ) {
        var code = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + code;
        hash &= hash;
      }

      return hash;
    }
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
          if ( this[i].compareTo(added[j]) == 0 ) {
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


/** Date prototype additions. */
foam.LIB({
  name: 'Date',

  methods: [
    function equals(o) {
      if ( ! o ) return false;
      if ( ! o.getTime ) return false;
      return this.getTime() === o.getTime();
    },

    function compareTo(o){
      if ( o === this ) return 0;
      if ( ! o ) return 1;
      var d = this.getTime() - o.getTime();
      return d == 0 ? 0 : d > 0 ? 1 : -1;
    }
  ]
});
