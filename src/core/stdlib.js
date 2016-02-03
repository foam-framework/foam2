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

// Setup nodejs-like 'global' on web
var global = global || this;

// Top-Level of foam package
foam = { array: {}, fn: {}, string: {}, util: {} };


foam.fn.memoize1 = function memoize1(f) {
  // Faster version of memoize() when only dealing with one argument.
  var cache = {};
  var g = function(arg) {
    console.assert(arguments.length == 1, "Memoize1'ed functions must take exactly one argument.");
    var key = arg ? arg.toString() : '';
    if ( ! cache.hasOwnProperty(key) ) cache[key] = f.call(this, arg);
    return cache[key];
  };
  foam.fn.setName(g, 'memoize1(' + f.name + ')');
  return g;
};


foam.fn.setName = function setName(f, name) {
  // Set a function's name for improved debugging and profiling
  //Object.defineProperty(f, 'name', {value: name, configurable: true}); //TODO: re-enable if supported
};

/** convenience method to append 'arguments' onto a real array */
foam.fn.appendArguments = function appendArguments(a, args, start) {
  for ( var i = start ; i < args.length ; i++ ) a.push(args[i]);
  return a;
},
/** convenience method to turn 'arguments' into a real array */
foam.fn.argsToArray = function argsToArray(args) {
  return foam.fn.appendArguments([], args, 0);
},


foam.string.constantize = foam.fn.memoize1(function(str) {
  // switchFromCamelCaseToConstantFormat to SWITCH_FROM_CAMEL_CASE_TO_CONSTANT_FORMAT
  return str.replace(/[a-z][^0-9a-z_]/g, function(a) {
    return a.substring(0,1) + '_' + a.substring(1,2);
  }).toUpperCase();
});


foam.string.pad = function(str, size) {
  // Right pads to size if size > 0, Left pads to -size if size < 0
  return size < 0 ?
    (new Array(-size).join(' ') + str).slice(size)       :
    (str + new Array(size).join(' ')).substring(0, size) ;
};

foam.events = {
  WILDCARD: '*', // TODO: remove once new topic publishing is ready
  
  /** Create a "one-time" listener which unsubscribes itself after its first invocation. **/
  oneTime: function oneTime(listener) {
    return function() {
      listener.apply(this, foam.fn.argsToArray(arguments));
      arguments[2](); // the unsubscribe fn
    };
  },

  /** Log all listener invocations to console. **/
  consoleLog: function consoleLog(listener) {
    return function() {
      var args = foam.fn.argsToArray(arguments);
      console.log(args);

      listener.apply(this, args);
    };
  },

  /**
   * Merge all notifications occuring in the specified time window into a single notification.
   * Only the last notification is delivered.
   *
   * @param opt_delay time in milliseconds of time-window, defaults to 16ms, which is
   *        the smallest delay that humans aren't able to perceive.
   **/
  merged: function merged(listener, opt_delay, opt_X) {
    var X = opt_X || /*X.*/X;
    var setTimeoutX = /*X.*/setTimeout;
    var delay = opt_delay || 16;

    return function() {
      var triggered    = false;
      var lastArgs     = null;

      var f = function() {
        lastArgs = arguments;

        if ( ! triggered ) {
          triggered = true;
          setTimeoutX(function() {
            triggered = false;
            var args = foam.fn.argsToArray(lastArgs);
            lastArgs = null;
            listener.apply(this, args);
          }, delay);
        }
      };
  //         if ( DEBUG ) f.toString = function() {
  //           return 'MERGED(' + delay + ', ' + listener.$UID + ', ' + listener + ')';
  //         };

      return f;
    }();
  },

  /**
   * Merge all notifications occuring until the next animation frame.
   * Only the last notification is delivered.
   **/
  // TODO: execute immediately from within a requestAnimationFrame
  framed: function framed(listener, opt_X) {
    var requestAnimationFrameX = ( opt_X && opt_X.requestAnimationFrame ) || requestAnimationFrame;

    return function() {
      var triggered    = false;
      var lastArgs     = null;

      var f = function() {
        lastArgs = arguments;

        if ( ! triggered ) {
          triggered = true;
          requestAnimationFrameX(function() {
            triggered = false;
            var args = foam.fn.argsToArray(lastArgs);
            lastArgs = null;
            listener.apply(this, args);
          });
        }
      };
  //         if ( DEBUG ) f.toString = function() {
  //           return 'ANIMATE(' + listener.$UID + ', ' + listener + ')';
  //         };
      return f;
    }();
  },

  /** Decorate a listener so that the event is delivered asynchronously. **/
  async: function async(listener, opt_X) {
    return this.delay(0, listener, opt_X);
  },

  /** Decorate a listener so that the event is delivered after a delay.
      @param delay the delay in ms **/
  delay: function delay(delay, listener, opt_X) {
    var setTimeoutX = ( opt_X && opt_X.setTimeout ) || setTimeout;
    return function() {
      var args = foam.fn.argsToArray(arguments);
      setTimeoutX( function() { listener.apply(null, args); }, delay );
    };
  },

};
