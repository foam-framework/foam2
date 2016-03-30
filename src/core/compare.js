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
      return a == b;
    },

    function compareDates(d1, d2) {
      if ( d1 === d2 ) return 0;
      if ( ! d1 ) return -1;
      if ( ! d2 ) return 1;
      var d = d1.getTime() - d2.getTime();
      return d == 0 ? 0 : d > 0 ? 1 : -1;
    },

    function compare(a, b) {
      if ( a === b ) return 0;

      if ( this.isDefined(a) && ! this.isDefined(b) ) return 1;

      if ( ! this.isDefined(a) && this.isDefined(b) ) return -1;

      if ( typeof a === 'number' && typeof b === 'number' )
        return a < b ? -1 : a > b ? 1 : 0;

      if ( typeof a === 'string' && typeof b === 'string' )
        return a < b ? -1 : a > b ? 1 : 0;

      if ( a instanceof Date && b instanceof Date )
        return this.compareDates(a, b);

      if ( a.compareTo ) return a.compareTo(b);

      if ( b.compareTo ) return - b.compareTo(a);

      if ( foam.compare.equals(a, b) ) return 0;

      return a.$UID.compareTo(b.$UID);
    }
  ]
});
