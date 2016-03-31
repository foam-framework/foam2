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
  name: 'compare',

  methods: [
    function isDefined(o) {
      return o !== undefined && o !== null;
    },

    function equals(a, b) {
      if ( a === b ) return true;
      if ( ! a || ! b ) return false;
      if ( a.equals ) return a.equals(b);
      if ( b.equals ) return b.equals(a);
      return this.compare(a, b) === 0;
    },

    function booleanCompare(a, b) {
      return a ? ( b ? 0 : 1 ) : b ? -1 : 0;
    },

    function numberCompare(a, b) {
      return a < b ? -1 : a > b ? 1 : 0;
    },

    function dateCompare(a, b) {
      return this.numberCompare(a.getTime(), b.getTime());
    },

    function stringCompare(a, b) {
      return a < b ? -1 : a > b ? 1 : 0;
    },

    function compare(a, b) {
      if ( a === b ) return 0;
      if ( this.isDefined(a) && ! this.isDefined(b) ) return 1;
      if ( ! this.isDefined(a) && this.isDefined(b) ) return -1;

      a = a.valueOf();
      b = b.valueOf();

      if ( typeof a === 'boolean' && typeof b === 'boolean' ) {
        return this.booleanCompare(a, b);
      }

      if ( typeof a === 'string' && typeof b === 'string' ) {
        return this.stringCompare(a, b);
      }

      if ( a.localeCompare ) return a.localeCompare(b);
      if ( b.localeCompare ) return - b.localeCompare(a);
      if ( a.compareTo ) return a.compareTo(b);
      if ( b.compareTo ) return - b.compareTo(a);

      if ( typeof a === 'number' && typeof b === 'number' ) {
        return this.numberCompare(a, b);
      }

      /*
        Handled by valueOf test above.
      if ( a instanceof Date && b instanceof Date ) {
        return this.dateCompare(a, b);
      }
      */

      return this.numberCompare(a.$UID, b.$UID);
    },

    function stringHashCode(s) {
      var hash = 0;

      for ( i = 0 ; i < s.length ; i++ ) {
        var code = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + code;
        hash &= hash;
      }
      
      return hash;
    },

    function arrayHashCode(a) {
      var hash = 0;

      for ( var i = 0 ; i < a.length ; i++ ) {
        hash = ((hash << 5) - hash) + this.hashCode(a[i]);
      }
      
      return hash;
    },

    function numberHashCode(n) {
      return n & n;
    },

    function dateHashCode(d) {
      return this.numberHashCode(d.getTime());
    },

    function hashCode(o) {
      if ( o === false ) return -1;
      if ( o === true ) return 1;
      if ( ! o ) return 0;
      if ( typeof o === 'String' ) return this.stringHashCode(o);
      if ( o.valueOf ) return this.numberHashCode(o.valueOf());
      if ( o instanceof Date ) return this.dateHashCode(o);
      if ( o.hashCode ) return o.hashCode();
      if ( Array.isArray(o) ) return this.arrayHashCode(o);
      return this.stringHashCode(o.toString());
    }
  ]
});
