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

var GLOBAL = global || this;
var X = GLOBAL.X;

/** Publish and Subscribe Event Notification Service. **/
CLASS({
  name: 'EventService_',

  constants: [
     /** Used as topic suffix to specify broadcast to all sub-topics. **/
     { name: 'WILDCARD', value: '*' },
  ],

  methods: [
    /** Create a "one-time" listener which unsubscribes itself after its first invocation. **/
    function oneTime(listener) {
      return function() {
        listener.apply(this, X.EventService.argsToArray(arguments));
        arguments[2](); // the unsubscribe fn
      };
    },

    /** Log all listener invocations to console. **/
    function consoleLog(listener) {
      return function() {
        var args = X.EventService.argsToArray(arguments);
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
    function merged(listener, opt_delay, opt_X) {
      var X = opt_X || GLOBAL.X;
      var setTimeoutX = X.setTimeout;
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
              var args = X.EventService.argsToArray(lastArgs);
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
    function framed(listener, opt_X) {
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
              var args = GLOBAL.X.EventService.argsToArray(lastArgs);
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
    function async(listener, opt_X) {
      return this.delay(0, listener, opt_X);
    },

    /** Decorate a listener so that the event is delivered after a delay.
        @param delay the delay in ms **/
    function delay(delay, listener, opt_X) {
      var setTimeoutX = ( opt_X && opt_X.setTimeout ) || setTimeout;
      return function() {
        var args = GLOBAL.X.EventService.argsToArray(arguments);
        setTimeoutX( function() { listener.apply(null, args); }, delay );
      };
    },

    /** convenience method to append 'arguments' onto a real array */
    function appendArguments(a, args, start) {
      for ( var i = start ; i < args.length ; i++ ) a.push(args[i]);
      return a;
    },
    /** convenience method to turn 'arguments' into a real array */
    function argsToArray(args) {
      return GLOBAL.X.EventService.appendArguments([], args, 0);
    },
  ],
});
// TODO: model static services like this one
X.EventService = X.EventService_.create({});

// MODEL({
//   name: 'EventPublisher',
X.EventPublisher = {

//   properties: [
    //subs_: null, // inited to {} when first used
//   ],

//   methods: [
    /** Returns true if any listener exists for the given topic, or if no
     *  topic is specified returns true if a listener exists for the entire object.
     */
    hasListeners: function(opt_topic) {
      if ( ! opt_topic ) {
        // we have a subs_ object, and it has at least one entry
        return ( !! this.subs_ ) && ( this.hasDirectListeners_(this.subs_) );
      } else if ( this.subs_ ) {
        // check that each level of the topic exists, and there's a listener array at the end
        var map = this.subs_;
        for (var t = 0; t <= opt_topic.length; ++t) {
          if ( ! map ) return false; // if nothing to check, fail
          if ( this.hasDirectListeners_(map) ) return true; // if any listeners at this level, we're good
          var topic = opt_topic[t];
          if ( topic == X.EventService.WILDCARD ) {
            // if a wildcard is specified, find any listener at all
            return this.hasAnyListeners_(map);
          }
          map = map[topic]; // try to move down a level
        }
      }
      return false;
    },

    /**
     * Publish a notification to the specified topic.
     *
     * @return number of subscriptions notified
     **/
    publish: function(topic) {
      return this.subs_ ?
        this.pub_(
          this.subs_,
          0,
          topic,
          X.EventService.appendArguments([this, topic, null], arguments, 1)) : // null: to be replaced with the unsub object
        0;
    },

    /** Publish asynchronously. **/
    publishAsync: function(topic) {
      var args = X.EventService.argsToArray(arguments);
      var self = this;
      setTimeout( function() { self.publish.apply(self, args); }, 0);
    },

    /**
     * Publishes a message to this object and all of its children.
     * Objects/Protos which have children should override the
     * standard definition, which is the same as just calling publish().
     **/
    deepPublish: function(topic) {
      return this.publish.apply(this, arguments);
    },

    /**
     * Publish a message supplied by a factory function.
     *
     * This is useful if the message is expensive to generate and you
     * don't want to waste the effort if there are no listeners.
     *
     * arg function fn which returns array, including the topic first.
     * TODO: why require the function to supply the topic again? We
     * already have it.
     **/
    lazyPublish: function(topic, fn) {
      if ( this.hasListeners(topic) ) return this.publish.apply(this, fn());
      return 0;
    },

    /** Subscribe to notifications for the specified topic. **/
    // TODO: Return subscription
    subscribe: function(topic, listener) {
      if ( ! this.subs_ ) this.subs_ = {};
      this.sub_(this.subs_, 0, topic, listener);
    },

    /** Unsubscribe a listener from the specified topic. **/
    unsubscribe: function(topic, listener) {
      if ( ! this.subs_ ) return;
      this.unsub_(this.subs_, 0, topic, listener);
    },

    /** Unsubscribe all listeners from this service. **/
    unsubscribeAll: function() {
      this.subs_ = {};
    },


//     ///////////////////////////////////////////////////////
//     //                                            Internal
//     /////////////////////////////////////////////////////

    pub_: function(map, topicIndex, topic, msg) {
      /**
        map: topicMap, topicIndex: index into 'topic', topic: array of topic path
        return: number of listeners published to
       **/
      var count = 0;

      // There are no subscribers, so nothing to do
      if ( map == null ) return 0;

      if ( topicIndex < topic.length ) {
        var t = topic[topicIndex];

        // wildcard publish, so notify all sub-topics, instead of just one
        if ( t == X.EventService.WILDCARD ) {
          return this.notifyListeners_(topic, map, msg, topic.slice(0, topicIndex-1));
        }
        if ( t ) count += this.pub_(map[t], topicIndex+1, topic, msg);
      }
      count += this.notifyListeners_(topic, map[null], msg, topic);
      return count;
    },

    sub_: function(map, topicIndex, topic, listener) {
      if ( topicIndex == topic.length ) {
        if ( ! map[null] ) map[null] = [];
        map[null].push(listener);
      } else {
        var key = topic[topicIndex];

        if ( ! map[key] ) map[key] = {};

        this.sub_(map[key], topicIndex+1, topic, listener);
      }
    },

    unsub_: function(map, topicIndex, topic, listener) {
      /**
        map: topicMap, topicIndex: index into 'topic', topic: array of topic path
        return: true iff there are no subscritions for this topic left
      **/
      if ( topicIndex == topic.length ) {
        if ( ! map[null] ) return true;

        var i = map[null].indexOf(listener);
        if ( i == -1 ) {
          // console.warn('phantom unsubscribe, size: ', map[null].length);
        } else {
          map[null].splice(i, 1); // TODO: was spliceF
        }

        if ( ! map[null].length ) delete map[null];
      } else {
        var key = topic[topicIndex];

        if ( ! map[key] ) return false;

        if ( this.unsub_(map[key], topicIndex+1, topic, listener) )
          delete map[key];
      }
      return Object.keys(map).length == 0;
    },

    /** @return true if the message was delivered without error. **/
    notifyListener_: function(topic, listener, msg, pathToListener) {
      var unsub = function unsubscribe() {
        this.unsubscribe(pathToListener, listener);
      }.bind(this);
      msg[2] = unsub;
      listener.apply(null, msg);
      msg[2] = null; // TODO: maybe not the best way to communicate the unsub
    },

    /** @return number of listeners notified.
        @param pathToListener provides the topic the listener was originally
        subscribed to, in order to find it. **/
    notifyListeners_: function(topic, listeners, msg, pathToListener) {
      if ( listeners == null ) return 0;
      if ( Array.isArray(listeners) ) {
        var originalLength = listeners.length;
        for ( var i = 0 ; i < listeners.length ; i++ ) {
          var listener = listeners[i];

          this.notifyListener_(topic, listener, msg, pathToListener);
        }
        return originalLength;
      }

      var count = 0;
      for ( var key in listeners ) {
        var newPath = pathToListener.slice();
        newPath.push(key);
        count += this.notifyListeners_(topic, listeners[key], msg, newPath);
      }
      return count;
    },

    /** Internal. Returns true if any listeners are present in the given subs_ object. */
    hasAnyListeners_: function(map) {
      for ( var key in map ) {
        subMap = map[key];
        return this.hasDirectListeners_(subMap) || this.hasAnyListeners_(subMap);
      }
    },

    /** Internal. Returns true if the given subs_ has direct listeners in its null key. */
    hasDirectListeners_: function(map) {
      return !! ( map[null] && map[null].length );
    },


//});
};


// /** Extend EventPublisher with support for dealing with property-change notification. **/
// MODEL({
//   name: 'PropertyChangePublisher',
X.PropertyChangePublisher = {
//   extends: 'EventPublisher',
  __proto__: X.EventPublisher,

//   constants: {
//     /** Root for property topics. **/
  PROPERTY_TOPIC: 'property',
//   },

//   methods: {
    /** Create a topic for the specified property name.
      TODO: re-add memoize1 when available */
    propertyTopic: /*memoize1(*/function (property) {
      return property ? [ this.PROPERTY_TOPIC, property ] : [ this.PROPERTY_TOPIC ];
    }/*)*/,

    /** Indicate that a specific property has changed.
        @param property the name of the property that has changed.
        @param oldValue the previous value
        @param newValue the new (current) value */
    propertyChange: function(property, oldValue, newValue) {
      this.propertyChange_(this.propertyTopic(property), oldValue, newValue);
    },

    /** Internal. Indicate that a specific property has changed.
        @pararm propertyTopic the topic array for the property. */
    propertyChange_: function(propertyTopic, oldValue, newValue) {
      // don't bother firing event if there are no listeners
      if ( ! this.subs_ ) return;

      // don't fire event if value didn't change
      if ( oldValue === newValue ||
           ((oldValue !== oldValue) && (newValue !== newValue)) /*NaN check*/
         ) return;
      this.publish(propertyTopic, oldValue, newValue);
    },

    /** Indicates that one or more unspecified properties have changed. **/
    globalChange: function() {
      this.publish(this.propertyTopic(X.EventService.WILDCARD), null, null);
    },

    /** Adds a listener for all property changes. **/
    addListener: function(listener) {
      // TODO: throw exception?
      console.assert(listener, 'Listener cannot be null.');
      this.addPropertyListener(null, listener);
    },

    /** Removes a listener for all property changes. **/
    removeListener: function(listener) {
      this.removePropertyListener(null, listener);
    },

    /** @param property the name of the property to listen to or 'null'
        to listen to all properties. **/
    addPropertyListener: function(property, listener) {
      this.subscribe(this.propertyTopic(property), listener);
    },

    /** @param property the name of the property listened to or 'null'
        to remove an all-properties listener. **/
    removePropertyListener: function(property, listener) {
      this.unsubscribe(this.propertyTopic(property), listener);
    },

// // TODO: needed? where to put it...
// //     /** Create a Value for the specified property. **/
// //     propertyValue: function(prop) {
// //       if ( ! prop ) throw 'Property Name required for propertyValue().';
// //       var props = this.props_ || ( this.props_ = {} );
// //       return Object.hasOwnProperty.call(props, prop) ?
// //         props[prop] :
// //         ( props[prop] = PropertyValue.create(this, prop) );
// //     }
//   }
// });
};
