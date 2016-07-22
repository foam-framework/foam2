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

/**
  Export common window/document services through the Context.

  Rather than using window or document directly, objects should import: the
  services that foam.core.Window exports:, and then access them as this.name,
  rather than as console.name or document.name.

  All FObjects already import: [ 'assert', 'error', 'log', 'warn' ], meaning
  that these do not need to be explicitly imported.

  This is done to remove dependency on the globals 'document' and 'window',
  which makes it easier to write code which works with multiple windows.

  It also allows for common services to be decorated, trapped, or replaced
  in sub-contexts (for example, to replace console.error and console.warn when
  running test).

  A foam.core.Window is installed by FOAM on starup for the default
  window/document, but if user code opens a new Window, it should create
  and install a new foam.core.Window explicitly.
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

    /**
      Like console.assert(), but faster and context-dependent.
      Returns the first argument, so that it can be nested as a sub-expression.
     */
    function assert(b /*, args */) {
      /* Like console.assert() except that it takes more than one argument. */
      if ( ! b ) {
        this.console.assert(false, Array.prototype.slice.call(arguments, 1).join(' '));
      }
      return b;
    },

    function error() { this.console.error.apply(this.console, arguments); },
    function info()  { this.console.info.apply(this.console, arguments);  },
    function log()   { this.console.log.apply(this.console, arguments);   },
    function warn()  { this.console.warn.apply(this.console, arguments);  },

    function async(l) {
      /* Decorate a listener so that the event is delivered asynchronously. */
      return this.delayed(l, 0);
    },

    function delayed(l, delay) {
      /* Decorate a listener so that events are delivered 'delay' ms later. */
      return foam.Function.bind(function() {
        this.setTimeout(
          function() { l.apply(this, arguments); },
          delay);
      }, this);
    },

    function merged(l, opt_delay) {
      var delay = opt_delay || 16;
      var ctx     = this;

      return foam.Function.setName(function() {
        var state = {
          triggered: false,
          lastArgs: null,
          l: l
        };
        return ctx.prepareMergedListener_(state, delay);
      }(), 'merged(' + l.name + ')');
    },

    function framed(l) {
      var ctx = this;

      return foam.Function.setName(function() {
        var state = {
          triggered: false,
          lastArgs: null,
          l: l
        };
        return ctx.prepareFramedListener_(state);
      }(), 'framed(' + l.name + ')');
    },

    function prepareMergedListener_(state, delay) {
      /* Wrap a merged listener with given state, overridden in
         foam.core.tracing. */
      return this.getMergedListener_(
        state, this.getAsyncListener_(state), delay);
    },

    function prepareFramedListener_(state) {
      /* Wrap a framed listener with given state, overridden in
         foam.core.tracing. */
      return this.getFramedListener_(state, this.getAsyncListener_(state));
    },

    function getAsyncListener_(state) {
      /* Get async wrapper for listener with given state, overridden in
         foam.core.tracing. */
      return function asyncListener() {
          state.triggered = false;
          var args = Array.from(state.lastArgs);
          state.lastArgs = null;
          state.l.apply(this, args);
      };
    },

    function getMergedListener_(state, mergedListener, delay) {
      /* Get merged callback for listener with given state, overridden in
         foam.core.tracing. */
      var ctx = this;
      return function merged() {
        state.lastArgs = arguments;

        if ( ! state.triggered ) {
          state.triggered = true;
          ctx.setTimeout(mergedListener, delay);
        }
      };
    },

    function getFramedListener_(state, frameFired) {
      /* Get framed callback for listener with given state, overridden in
         foam.core.tracing. */
      var ctx = this;
      return function framed() {
        state.lastArgs = arguments;

        if ( ! state.triggered ) {
          state.triggered = true;
          ctx.requestAnimationFrame(frameFired);
        }
      };
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


foam.__context__ = foam.core.Window.create({window: global}, foam.__context__).__subContext__;
