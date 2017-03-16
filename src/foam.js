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

  var isServer = typeof window === 'undefined';
  var isWorker = typeof importScripts !== 'undefined';

  var flags = this.FOAM_FLAGS || {};
  flags.web = ! isServer,
  flags.node = isServer;
  flags.loader = ! isServer;
  if ( ! flags.hasOwnProperty('debug') ) flags.debug = true;
  if ( flags.web || flags.node ) flags.js = true;

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

    path = path.substring(0, path.lastIndexOf('/')+1);

    return function(filename) {
      document.writeln(
        '<script type="text/javascript" src="' + path + filename + '.js"></script>\n');
    };
  }

  function loadServer(filename) {
    require('./' + filename + '.js');
  }

  function createLoadWorker(filename) {
    var path = FOAM_BOOT_PATH;
    return function(filename) {
      importScripts(path + filename + '.js');
    };
  }

  var load = isServer ? loadServer :
    isWorker ? createLoadWorker() :
    createLoadBrowser();

  this.FOAM_FILES = function(files) {
    files.
      filter(function(f) {
        if ( ! f.flags ) return true;
        for ( var i = 0; i < f.flags.length; i++ ) {
          if ( ! flags[f.flags[i]] ) return false;
        }
        return true;
      }).
      map(function(f) { return f.name; }).
      forEach(load);

    delete this.FOAM_FILES;
  };

  load('files');
})();
