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

// Required on IE 11, Android Browser before 5.1.
if ( ! Math.trunc ) {
  Math.trunc = function trunc(v) {
    return v > 0 ? Math.floor(v) : Math.ceil(v);
  };
}

// Required on IE 11, Android Browser (at least to 5.1).
if ( ! Array.from ) {
  /** Turn array-like objects into real arrays. **/
  Array.from = function(a) {
    var b = new Array(a.length);
    for ( var i = 0 ; i < a.length ; i++ ) b[i] = a[i];
    return b;
  }
}

// Required on IE 11, Android Browser (at least to 5.1).
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

// Required on IE 11, Android Browser (at least to 5.1).
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

// Required on IE 11, Android Browser (at least to 5.1).
if ( ! String.prototype.startsWith ) {
  String.prototype.startsWith = function(str, pos) {
    return this.indexOf(str) === 0;
  };
}

// Required for IE 11.
if ( ! Number.isInteger ) {
  Number.isInteger = function(value) {
    return typeof value === 'number' &&
        isFinite(value) &&
        Math.floor(value) === value;
  }
}

if ( ! Object.values ) {
  Object.values = function(obj) {
    return Object.keys(obj).map(function(k) { return obj[k]; });
  };
}
