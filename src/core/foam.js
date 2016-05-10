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

(function() {

  var isServer = typeof process === 'object';
  var isWorker = typeof importScripts !== 'undefined';

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
    }
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

  [
    "poly",
    "lib",
    "stdlib",
    "events",
    "Context",
    "AbstractClass",
    "Boot",
    "FObject",
    "Model",
    "Property",
    "Method",
    "String",
    "FObjectArray",
    "Boolean",
    "Int",
    "AxiomArray",
    "EndBoot",
    "types",
    "Topic",
    "Constant",
    "InnerClass",
    "Implements",
    "ImportsExports",
    "Listener",
    "IDSupport",
    "Requires",
    "Slot",
    "Window",
    "debug",
    "patterns",
    "JSON",
    "parse",
    "templates",
    "Action",
    "../lib/Promise",
    "../lib/Timer",
    [ "../lib/graphics", ! isServer ],
    "../lib/dao",
    "../lib/mlang",
    "../lib/AATree",
    "../lib/Index",
    "../lib/MDAO",
    [ "../lib/IDBDAO", ! isServer ],
    "../lib/Pooled",
    "../lib/Physical",
    "../lib/Collider",
    "../lib/PhysicsEngine",
    ["../lib/PhysicalCircle", ! isServer ],
    [ "../lib/node/json_dao", isServer ],
    "../lib/utf8",
    "../lib/net",
    "../lib/firebase",
    "../lib/box",
    [ "../lib/node/net", isServer ],
    [ "../lib/node/box", isServer ]
  ].
      filter(function (f) { return ! Array.isArray(f) || f[1]; }).
      map(function(f) { return Array.isArray(f) ? f[0] : f; }).
      forEach(isServer ? loadServer :
              isWorker ? createLoadWorker() :
              createLoadBrowser());
})();
