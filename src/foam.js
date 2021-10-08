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

(function() {

  var isWorker = typeof importScripts !== 'undefined';
  var isServer = ( ! isWorker ) && typeof window === 'undefined';

  // Imports used by the loadServer() loader
  if ( isServer && typeof global !== 'undefined' ) {
    global.imports = {}; global.imports.path = require('path');
  }

  var flags    = this.FOAM_FLAGS = this.FOAM_FLAGS || {};
  flags.web    = ! isServer;
  flags.node   = isServer;
  flags.loader = ! isServer;
  if ( ! flags.hasOwnProperty('java')  ) flags.java  = false;
  if ( ! flags.hasOwnProperty('swift') ) flags.swift = false;
  if ( ! flags.hasOwnProperty('debug') ) flags.debug = true;
  if ( ! flags.hasOwnProperty('js')    ) flags.js    = true;

  function createLoadBrowser() {
    var path = document.currentScript && document.currentScript.src;

    // document.currentScript isn't supported on all browsers, so the following
    // hack gets the job done on those browsers.
    if ( ! path ) {
      var scripts = document.getElementsByTagName('script');
      for ( var i = 0 ; i < scripts.length ; i++ ) {
        if ( scripts[i].src.match(/\/foam.js$/) ) {
          path = scripts[i].src;
          break;
        }
      }
    }
    path = path && path.length > 3 && path.substring(0, path.lastIndexOf('src/')+4) || '';

    if ( typeof global !== 'undefined' && ! global.FOAM_ROOT ) global.FOAM_ROOT = path;
    if ( typeof window !== 'undefined' && ! window.FOAM_ROOT ) window.FOAM_ROOT = path;

    var loadedMap = {};
    var scripts = '';

    return function(filename, opt_batch) {
      if ( filename && loadedMap[filename] ) {
        console.warn(`Duplicated load of '${filename}'`);
        return;
      }
      loadedMap[filename] = true;

      if ( filename ) {
        scripts += '<script type="text/javascript" src="' + path + filename + '.js"></script>\n';
      }

      if ( ! opt_batch ) {
        document.writeln(scripts);
        scripts = '';
      }
    };
  }

  function loadServer() {
    var caller = flags.src || __filename;
    var path = caller.substring(0, caller.lastIndexOf('src/')+4);

    if ( typeof global !== 'undefined' && ! global.FOAM_ROOT ) global.FOAM_ROOT = path;

    return function (filename) {
      if ( ! filename ) return;
      if ( typeof global !== 'undefined' ) {
        // Set document.currentScript.src, as expected by EndBoot.js
        let normalPath = global.imports.path.relative(
          '.', global.imports.path.normalize(path + filename + '.js'));
        global.document = { currentScript: { src: normalPath } };
      }
      require(path + filename + '.js');
    }
  }

  function createLoadWorker(filename) {
    var path = FOAM_BOOT_PATH;
    return function(filename) {
      importScripts(path + filename + '.js');
    };
  }

  function getLoader() {
    return isServer ? loadServer() :
      isWorker ? createLoadWorker() :
      createLoadBrowser();
  }

  this.FOAM_FILES = async function(files) {
    var load = getLoader();

    files.
      map(function(f) { return f.name; }).
      forEach(f => load(f, true));

    load(null, false);

  //  delete this.FOAM_FILES;
  };

  getLoader()('files', false);
})();
