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
 * @fileoverview Base implementation of the conteXt object.
 * @author markdittmer (Mark Dittmer)
 */

/**
 * The Javascript global object.
 * @global
 */
var GLOBAL = global || this;

/**
 * The global conteXt object.
 *
 * @global
 * @extends GLOBAL
 * @namespace X
 */
GLOBAL.X = Object.create(GLOBAL);

/**
 * Creates a sub-context, optionally copying opt_args into it.
 *
 * @memberof X
 * @function sub
 * @param {object} opt_args An optional collection of key-value pairs to assign
 *     to the freshly sprouted conteXt object.
 * @return {object} A conteXt object that inherits from {@code this}.
 */
GLOBAL.X.sub = function(opt_args) {
  var Y = Object.create(this);
  if ( ! opt_args ) return Y;
  for ( var key in opt_args ) {
    if ( opt_args.hasOwnProperty(key) ) Y[key] = opt_args[key];
  }
  return Y;
};

/**
 * Verifies the integrity of a package path passed to {@code this.set} or
 * {@code this.lookup}.
 *
 * @memberof X
 * @function verifyPackagePath_
 * @private
 * @param {string} path The pcackage path to be verified.
 * @return {Array<string>} The package path described by {@code path}.
 * @throws {Error} Error thrown when package path is invalid.
 */
GLOBAL.X.verifyPackagePath_ = function(path) {
  if ( ! typeof path === 'string' )
    throw new Error('Invalid package path: ' + path.toString());
  var pathParts = path.split('.');
  var i;
  for ( i = 0; i < pathParts.length; i++ ) {
    if ( ! pathParts[i] )
      throw new Error('Invalid package path: "' + pathParts.join('.') + '"');
  }
  return pathParts;
};

/**
 * Sets a package-path value on the context.
 *
 * @memberof X
 * @function set
 * @param {string} path The package path where the value is to be stored.
 * @param {any} value The value to be stored.
 * @return {any} The value that was stored (if any).
 * @throws {Error} Error thrown when package path is invalid.
 */
GLOBAL.X.set = function(path, value) {
  var parts = this.verifyPackagePath_(path);
  var obj = this;

  // Set path, initializing objects as needed.
  for ( var i = 0; i < parts.length - 1; i++ ) {
    if ( !  obj[parts[i]] ) obj[parts[i]] = {};
    obj = obj[parts[i]];
  }
  return ( obj[parts[parts.length - 1]] = value );
};

/**
 * Looks up the value stored at a particular package path on the {@code this}
 * conteXt.
 *
 * @memberof X
 * @function lookup
 * @param {string} path The package path where the value is stored.
 * @return {any} The value that was found (if any), or else {@code undefined}.
 * @throws {Error} Error thrown when package path is invalid.
 */
GLOBAL.X.lookup = function(path) {
  var parts = this.verifyPackagePath_(path);
  var obj = this;
  for ( var i = 0; i < parts.length; i++ ) {
    if ( typeof obj === 'undefined' ) return undefined;
    obj = obj[parts[i]];
  }
  return obj;
};
