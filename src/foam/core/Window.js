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

foam.CLASS({
  package: 'foam.core',
  name: 'Window',
  requires: [
    'foam.nanos.theme.Theme'
  ],
  documentation: function(){/*
    Encapsulates top-level window/document features.

    Export common window/document services through the Context.

    Rather than using window or document directly, objects should import: the
    services that foam.core.Window exports:, and then access them as this.name,
    rather than as console.name or document.name.

    All FObjects already import: [ 'error', 'log', 'warn' ], meaning
    that these do not need to be explicitly imported.

    This is done to remove dependency on the globals 'document' and 'window',
    which makes it easier to write code which works with multiple windows.

    It also allows for common services to be decorated, trapped, or replaced
    in sub-contexts (for example, to replace console.error and console.warn when
    running test).

    A foam.core.Window is installed by FOAM on starup for the default
    window/document, but if user code opens a new Window, it should create
    and install a new foam.core.Window explicitly.
  */},

  exports: [
    'getElementsByClassName',
    'getElementById',
    'async',
    'cancelAnimationFrame',
    'clearInterval',
    'clearTimeout',
    'console',
    'debug',
    'delayed',
    'document',
    'error',
    'framed',
    'info',
    'installCSS',
    'log',
    'merged',
    'requestAnimationFrame',
    'setInterval',
    'setTimeout',
    'warn',
    'window',
    'theme'
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
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.theme.Theme',
      name: 'theme',
      factory: function() {
        return this.Theme.create();
      }
    }
  ],

  methods: [
    function getElementById(id) {
      return this.document.getElementById(id);
    },

    function getElementsByClassName(cls) {
      return this.document.getElementsByClassName(cls);
    },

    function debug() {
      this.console.debug.apply(this.console, arguments);
    },

    function error() {
      this.console.error.apply(this.console, arguments);
    },

    function info() {
      this.console.info.apply(this.console, arguments);
    },

    function log() {
      this.console.log.apply(this.console, arguments);
    },

    function warn() {
      this.console.warn.apply(this.console, arguments);
    },

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
        var triggered = false;
        var lastArgs  = null;
        function mergedListener() {
          triggered = false;
          var args = Array.from(lastArgs);
          lastArgs = null;
          l.apply(this, args);
        }

        var f = function() {
          lastArgs = arguments;

          if ( ! triggered ) {
            triggered = true;
            ctx.setTimeout(mergedListener, delay);
          }
        };

        return f;
      }(), 'merged(' + l.name + ')');
    },

    function framed(l) {
      var ctx = this;

      return foam.Function.setName(function() {
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
            ctx.requestAnimationFrame(frameFired);
          }
        };

        return f;
      }(), 'framed(' + l.name + ')');
    },

    function setTimeout(f, t) {
      return this.window.setTimeout(f, t);
    },
    function clearTimeout(id) {
      this.window.clearTimeout(id);
    },

    function setInterval(f, t) {
      return this.window.setInterval(f, t);
    },
    function clearInterval(id) {
      this.window.clearInterval(id);
    },

    function requestAnimationFrame(f) {
      return this.window.requestAnimationFrame(f);
    },
    function cancelAnimationFrame(id) {
      this.window.cancelAnimationFrame(id);
    },
    function expandShortFormMacro(css, m) {
      /* A short-form macros is of the form %PRIMARY_COLOR%. */
      var M = m.toUpperCase();

      // NOTE: We add a negative lookahead for */, which is used to close a
      // comment in CSS. We do this because if we don't, then when a developer
      // chooses to include a long form CSS macro directly in their CSS such as
      //
      //                       /*%EXAMPLE%*/ #abc123
      //
      // then we don't want this method to expand the commented portion of that
      // CSS because it's already in long form. By checking if */ follows the
      // macro, we can tell if it's already in long form and skip it.
      return css.replace(
        new RegExp('%' + M + '%(?!\\*/)', 'g'),
        '/*%' + M + '%*/ ' + this.theme[m]);
    },

    function expandLongFormMacro(css, m) {
      // A long-form macros is of the form "/*%PRIMARY_COLOR%*/ blue".
      var M = m.toUpperCase();

      return css.replace(
        new RegExp('/\\*%' + M + '%\\*/[^;]*', 'g'),
        '/*%' + M + '%*/ ' + this.theme[m]);
    },

    function installCSS(text, id) {
      /** CSS preprocessor, works on classes instantiated in subContext. */
      if ( text ) {
        var eid = foam.u2.Element.NEXT_ID();

        for ( var i = 0 ; i < this.Theme.MACROS.length ; i++ ) {
          let m     = this.Theme.MACROS[i];
          var text2 = this.expandShortFormMacro(this.expandLongFormMacro(text, m), m);

            // If the macro was found, then listen for changes to the property
            // and update the CSS if it changes.
            if ( text != text2 ) {
              text = text2;
              this.onDetach(this.theme$.dot(m).sub(() => {
                var el = this.getElementById(eid);
                el.innerText = this.expandLongFormMacro(el.innerText, m);
              }));
            }
        }

        var eid = foam.u2.Element.NEXT_ID();
        /* Create a new <style> tag containing the given CSS code. */
        this.document && this.document.head.insertAdjacentHTML(
          'beforeend',
          '<style id="' + eid + '" owner="' + id + '">' + text + '</style>');
        }
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'WindowNodeJSRefinement',
  refines: 'foam.core.Window',
  flags: [ 'node' ],
  methods: [
    function requestAnimationFrame(f) {
      return this.setTimeout(f, 16);
    },
    function cancelAnimationFrame(id) {
      this.clearTimeout(id);
    }
  ]
});


// Replace top-level Context with one which includes Window's exports.
foam.SCRIPT({
  package: 'foam.core',
  name: 'WindowScript',
  requires: [
    'foam.core.Window',
  ],
  code: function() {
    foam.__context__ = foam.core.Window.create(
      { window: global },
      foam.__context__
    ).__subContext__;
  }
});
