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

// Polyfill

if ( ! Math.trunc ) {
  Math.trunc = function trunc(v) {
    return v > 0 ? Math.floor(v) : Math.ceil(v);
  };
}
if ( ! Array.from ) {
  /** Turn array-like objects into real arrays. **/
  Array.from = function(a) {
    var b = new Array(a.length);
    for ( var i = 0 ; i < a.length ; i++ ) b[i] = a[i];
    return b;
  }
}


if ( ! Array.prototype.find ) {
  Array.prototype.find = function(predicate) {
    if ( this === null ) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if ( typeof predicate !== 'function' ) {
      throw new TypeError('predicate must be a function');
    }
    var list    = Object(this);
    var length  = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for ( var i = 0 ; i < length ; i++ ) {
      value = list[i];
      if ( predicate.call(thisArg, value, i, list) ) return value;
    }
    return undefined;
  };
}


if ( ! String.prototype.endsWith ) {
  // Official polyfill
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if ( typeof position !== 'number' ||
          ! isFinite(position) ||
          Math.floor(position) !== position ||
          position > subjectString.length ) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}

if ( ! String.prototype.startsWith ) {
  String.prototype.startsWith = function(str, pos) {
    return this.indexOf(str) === 0;
  };
}

(function() {
  if ( this.WeakMap ) return;
  this.WeakMap = function WeakMap() {
    var id = '__WEAK_MAP__' + this.$UID;

    function del(key) { delete key[id]; }
    function get(key) { return key[id]; }
    function set(key, value) { key[id] = value; }
    function has(key) { return !!key[id]; }

    return {
      __proto__: this,
      "delete": del,
      get: get,
      set: set,
      has: has
    };
  };
})();
