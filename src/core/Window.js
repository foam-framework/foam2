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

foam.CLASS({
  package: 'foam.core',
  name: 'Window',

  // documentation: 'Encapsulates top-level window/document features.',

  exports: [
    'getElementsByClassName',
    'getElementById',
    'assert',
    'async',
    'cancelAnimationFrame',
    'clearInterval',
    'clearTimeout',
    'console',
    'delayed',
    'document',
    'dynamic',
    'error',
    'framed',
    'info',
    'log',
    'merged',
    'requestAnimationFrame',
    'setInterval',
    'setTimeout',
    'warn',
    'window'
  ],

  properties: [
    [ 'name', 'window' ],
    'window',
    {
      name: 'document',
      factory: function() { return this.window.document; }
    },
    {
      name: 'console',
      factory: function() { return this.window.console; }
    }
  ],

  methods: [
    function getElementById(id) {
      return this.document.getElementById(id);
    },

    function getElementsByClassName(cls) {
      return this.document.getElementsByClassName(cls);
    },

    function assert(b /*, args */) {
      /* Like console.assert() except that it takes more than one argument. */
      if ( ! b ) {
        this.console.assert(false, [].splice.call(arguments, 1).join(''));
      }
    },

    function error() { this.console.error.apply(this.console, arguments); },
    function info()  { this.console.info.apply(this.console, arguments); },
    function log()   { this.console.log.apply(this.console, arguments); },
    function warn()  { this.console.warn.apply(this.console, arguments); },

    function async(l) {
      /* Decorate a listener so that the event is delivered asynchronously. */
      return this.delayed(l, 0);
    },

    function delayed(l, delay) {
      /* Decorate a listener so that events are delivered 'delay' ms later. */
      return foam.fn.bind(function() {
        this.setTimeout(
          function() { l.apply(this, arguments); },
          delay);
      }, this);
    },

    function merged(l, opt_delay) {
      var delay = opt_delay || 16;
      var X     = this;

      return function() {
        var triggered = false;
        var lastArgs  = null;
        function mergedListener() {
          triggered = false;
          var args = foam.array.argsToArray(lastArgs);
          lastArgs = null;
          l.apply(this, args);
        }

        var f = function() {
          lastArgs = arguments;

          if ( ! triggered ) {
            triggered = true;
            X.setTimeout(mergedListener, delay);
          }
        };

        return f;
      }();
    },

    function framed(l) {
      var X = this;

      return function() {
        var triggered = false;
        var lastArgs  = null;
        function frameFired() {
          triggered = false;
          var args = lastArgs;
          lastArgs = null;
          l.apply(this, args);
        }

        var f = function framed() {
          lastArgs = arguments;

          if ( ! triggered ) {
            triggered = true;
            X.requestAnimationFrame(frameFired);
          }
        };

        return f;
      }();
    },

    function dynamic() {
    },

    function setTimeout(f, t) {
      return this.window.setTimeout.apply(this.window, arguments);
    },
    function clearTimeout(id) {
      this.window.clearTimeout(id);
    },

    function setInterval(f, t) {
      return this.window.setInterval.apply(this.window, arguments);
    },
    function clearInterval(id) {
      this.window.clearInterval(id);
    },

    function requestAnimationFrame(f) {
      return this.window.requestAnimationFrame(f);
    },
    function cancelAnimationFrame(id) {
      this.window.cancelAnimationFrame(id);
    }
  ]
});


/*
 * requestAnimationFrame is not available on nodejs,
 * so swap out with calls to setTimeout.
 */
if ( foam.isServer ) {
  foam.CLASS({
    refines: 'foam.core.Window',
    methods: [
      function requestAnimationFrame(f) {
        return this.setTimeout(f, 16);
      },
      function cancelAnimationFrame(id) {
        this.clearTimeout(id);
      }
    ]
  });
}


foam.X = foam.core.Window.create({window: global}, foam).Y;
