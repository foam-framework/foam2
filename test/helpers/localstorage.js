/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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

// Polyfills localStorage if it's not defined.

if ( typeof localStorage === 'undefined' || localStorage === null ) {
  function LocalStorage() {
  }

  LocalStorage.prototype.getItem = function(key) {
    return this[key];
  };

  LocalStorage.prototype.setItem = function(key, value) {
    this[key] = value;
  };

  LocalStorage.prototype.removeItem = function(key) {
    delete this[key];
  };

  LocalStorage.prototype.clear = function() {
    for ( var key in this ) {
      if ( this.hasOwnProperty(key) ) {
        delete this[key];
      }
    }
  };

  localStorage = new LocalStorage();
}
