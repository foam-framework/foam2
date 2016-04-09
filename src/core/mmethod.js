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
  Rather than extending built-in prototypes, we create flyweight versions.

  This has a number of advantages:
  1. It avoids conflicts with other libraries which might also extend built-in
     types with methods with the same names but different semantics.
  2. It is >10X faster (in V8) to call a flyweight method than a Method added
     to the prototypes of String or Number. This is because calling an added
     method on those types promotes the object from a string or number to a
     String or Number, and creates a new object which will need to be GC'ed.
  3. It lets us effectively add methods to built-in special values like
     true, false, null, and undefined. This avoids the need for null-pointer
     checks.
  4. It avoids the proliferation of large ===/typeof/isInstance/instanceof blocks
     throughout the rest of the code.
  5. It provides a consistent method for checking an object's type, since each
     type flyweight has an .is() method which abstracts the underlying detection
     mechanism.
  6. It makes the future implementation of multi-methods much easier.
*/
 
foam.LIB({
  name: 'foam.types.Undefined',
  methods: [
    function is(o) { return o === undefined; },
    function equals(_, b) { return b === undefined; },
    function compare(_, b) { return b === undefined ? 0 : 1; },
    function hashCode() { return -1; }
  ]
});


foam.LIB({
  name: 'foam.types.Null',
  methods: [
    function is(o) { return o === null; },
    function equals(_, b) { return b === null; },
    function compare(_, b) { return b === null ? 0 : b === undefined ? -1 : 1; },
    function hashCode() { return -2; }
  ]
});


foam.LIB({
  name: 'foam.types.Boolean',
  methods: [
    function is(o) { return typeof o === 'boolean'; },
    function equals(a, b) { return a === b; },
    function compare(a, b) { return a ? (b ? 0 : 1) : (b ? -1 : 0); },
    function hashCode(o) { return o ? 1 : 0; }
  ]
});


foam.LIB({
  name: 'foam.types.True',
  methods: [
    function is(o) { return o === true; },
    function equals(_, b) { return b === true; },
    function compare(_, b) { return b ? 0 : 1; },
    function hashCode() { return 1; }
  ]
});


foam.LIB({
  name: 'foam.types.False',
  methods: [
    function is(o) { return o === false; },
    function equals(_, b) { return b === false; },
    function compare(_, b) { return b ? -1 : 0; },
    function hashCode() { return 0; }
  ]
});


foam.LIB({
  name: 'foam.types.Number',
  methods: [
    function is(o) { return typeof o === 'number'; },
    function equals(a, b) { return a === b; },
    function compare(a, b) { return b == null ? 1 : a < b ? -1 : a > b ? 1 : 0; },
    function hashCode(n) { return n & n; }
  ]
});


foam.LIB({
  name: 'foam.types.String',
  methods: [
    function is(o) { return typeof o === 'string'; },
    function equals(a, b) { return a === b; },
    function compare(a, b) { return b != null ? a.localeCompare(b) : 1 ; },
    function hashCode(s) {
      var hash = 0;

      for ( i = 0 ; i < s.length ; i++ ) {
        var code = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + code;
        hash &= hash;
      }

      return hash;
    }
  ]
});


foam.LIB({
  name: 'foam.types.Array',
  methods: [
    function is(o) { return Array.isArray(o); },
    function equals(a, b) {
      if ( ! b || ! Array.isArray(b) || a.length !== b.length ) return false;
      for ( var i = 0 ; i < a.length ; i++ ) {
        if ( ! foam.compare.equals(a[i], b[i]) ) return false;
      }
      return true;
    },
    function compare(a, b) {
      if ( ! b || ! Array.isArray(b) ) return false;
      var l = Math.min(a.length, b.length);
      for ( var i = 0 ; i < l ; i++ ) {
        var c = foam.compare.compare(a[i], b[i]);
        if ( c ) return c;
      }
      return a.length === b.length ? true : a.length < b.length ? -1 : 1;
    },
    function hashCode(a) {
      var hash = 0;

      for ( var i = 0 ; i < a.length ; i++ ) {
        hash = ((hash << 5) - hash) + this.hashCode(a[i]);
      }

      return hash;
    }
  ]
});


foam.LIB({
  name: 'foam.types.Date',
  methods: [
    function is(o) { return o instanceof Date; },
    function getTime(d) { return ! d ? 0 : d.getTime ? d.getTime() : d ; },
    function equals(a, b) { return this.getTime(a) === this.getTime(b); },
    function compare(a, b) {
      a = this.getTime(a);
      b = this.getTime(b);
      return a < b ? -1 : a > b ? 1 : 0;
    },
    function hashCode(d) { var n = d.getTime(); return n & n; }
  ]
});


foam.LIB({
  name: 'foam.types.FObject',
  methods: [
    function is(o) { return foam.core.FObject.isInstance(o); },
    function equals(a, b) { return a.equals(b); },
    function compare(a, b) { return a.compareTo(b); },
    function hashCode(o) { return o.hashCode(); }
  ]
});


foam.LIB({
  name: 'foam.types.Object',
  methods: [
    function is(o) { return typeof o === 'object'; },
    function equals(a, b) { return a === b; },
    function compare(a, b) {
      return foam.types.Number.compare(a.$UID, b ? b.$UID : -1);
    },
    function hashCode(o) { return 0; }
  ]
});


foam.typeOf = (function() {
  var types    = foam.types,
    tNumber    = types.Number,
    tString    = types.String,
    tUndefined = types.Undefined,
    tNull      = types.Null,
    tTrue      = types.True,
    tFalse     = types.False,
    tArray     = types.Array,
    tDate      = types.Date,
    tFObject   = types.FObject,
    tObject    = types.Object;

  return function typeOf(o) {
    if ( tNumber.is(o)    ) return tNumber;
    if ( tString.is(o)    ) return tString;
    if ( tUndefined.is(o) ) return tUndefined;
    if ( tNull.is(o)      ) return tNull;
    if ( tTrue.is(o)      ) return tTrue;
    if ( tFalse.is(o)     ) return tFalse;
    if ( tArray.is(o)     ) return tArray;
    if ( tDate.is(o)      ) return tDate;
    if ( tFObject.is(o)   ) return tFObject;
    return tObject;
  }
})();


( function() {
  var typeOf = foam.typeOf;

  foam.LIB({
    name: 'foam.compare',

    methods: [
      function equals(a, b)  { return typeOf(a).equals(a, b); },
      function compare(a, b) { return typeOf(a).compare(a, b); },
      function hashCode(o)   { return typeOf(o).hashCode(o); }
    ]
  });
} )();
