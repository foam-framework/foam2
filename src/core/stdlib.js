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

  oneTime: function oneTime(listener) {
    /** Create a "one-time" listener which unsubscribes itself after its first invocation. **/
    return function(subscription) {
      listener.apply(this, foam.fn.argsToArray(arguments));
      subscription.destroy();
    };
  },

  consoleLog: function consoleLog(listener) {
    /** Log all listener invocations to console. **/
    return function() {
      var args = foam.fn.argsToArray(arguments);
      console.log(args);

      listener.apply(this, args);
    };
  },

  Observable: {
    create: function(name, src) {
      var o = Object.create(this);
      o.name = name;
      o.src  = src;
      return o;
    },

    notifyListeners_: function(node, args) {
      var count = 0;
      while ( node && node.next ) {
        node = node.next;
        args[0] = node.sub;
        node.l.apply(null, args);
        count++;
      }
      return count;
    },

    hasListeners_: function(topic) {
      if ( ! topic ) return !! this.next;
      return !! ( this.topics_ && this.topics_[topic] && this.topics_[topic].next );
    },

    topic: function(topic) {
      var self = this;
      return {
        pub: function() {
          if ( ! self.hasListeners_(topic) ) return 0;
          return self.pub_(topic, foam.fn.argsToArray(arguments));
        },
        sub: function(l) { return self.sub_(topic, l); },
        unsub: function(l) { return self.unsub_(topic, l); }
      };
    },

    pub: function(/*args */) {
      if ( ! this.hasListeners_() ) return 0;
      return this.pub_(null, foam.fn.argsToArray(arguments));
    },

    pub_: function(topic, args) {
      var args = [null, topic].concat(args);
      var topicSubs = topic && this.topics_ && this.topics_[topic];
      return this.notifyListeners_(topicSubs, args) +
        this.notifyListeners_(this, args);
    },

    sub: function(l) { return this.sub_(null, l); },

    sub_: function(topic, l) {
      var subs;
      if ( topic ) {
        var topics = this.topics_ || ( this.topics_ = {} );
        subs = topics[topic] || (topics[topic] = {});
      } else {
        subs = this;
      }

      var node = {
        prev: subs,
        next: subs.next,
        l: l,
        sub: { src: this.src, topic: this }
      };
      subs.next = node;

      node.sub.destroy = function() {
        if ( node.next ) node.next.prev = node.prev;
        if ( node.prev ) node.prev.next = node.next;

        // Disconnect so that calling destroy more than once is harmless
        this.next = this.prev = null;
      };

      return node.sub;
    },

    unsub: function(l) { return this.unsub_(null, l); },

    unsub_: function(topic, l) {
      var subs;
      if ( topic ) {
        if ( ! this.topics_ ) return;
        subs = this.topics_[topic];
        if ( ! subs ) return;
      } else {
        subs = this;
      }

      while ( subs.next ) {
        if ( subs.next.l === l ) {
          subs.next = subs.next.next;
          if ( subs.next ) subs.next.prev = subs;
          return;
        }
        subs = subs.next;
      }
    },

    destroy: function() {
      // TODO: better to walk and disconnect linked-lists in case
      // external objects have references to subscriptions.
      this.next = this.topics_ = undefined;
    },

    toString: function() {
      return 'Topic(' + this.name + ')';
    }
  }
};
