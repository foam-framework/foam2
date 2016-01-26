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

/** Publish and Subscribe Event Notification Service. **/

// MODEL({
//   name: 'EventService',
var EventService = {

//   constants: {
//     /** Used as topic suffix to specify broadcast to all sub-topics. **/
     WILDCARD: '*',
//   },

//   methods: [
//     /** Create a "one-time" listener which unsubscribes itself after its first invocation. **/
// //    function oneTime(listener) {
// //      return function() {
// //        listener.apply(this, argsToArray(arguments));
// //        var unsub = arguments[1];
// //        unsub();
// //      };
// //    },

//     /** Log all listener invocations to console. **/
//     function consoleLog(listener) {
//       return function() {
//         var args = argsToArray(arguments);
//         console.log(args);

//         listener.apply(this, args);
//       };
//     },

//     /**
//      * Merge all notifications occuring in the specified time window into a single notification.
//      * Only the last notification is delivered.
//      *
//      * @param opt_delay time in milliseconds of time-window, defaults to 16ms, which is
//      *        the smallest delay that humans aren't able to perceive.
//      **/
//     function merged(listener, opt_delay, opt_X) {
//       var setTimeoutX = ( opt_X && opt_X.setTimeout ) || setTimeout;
//       var delay = opt_delay || 16;

//       return function() {
//         var triggered    = false;
//         var unsubscribed = false;
//         var lastArgs     = null;

//         var f = function() {
//           lastArgs = arguments;

//           if ( unsubscribed ) arguments[1]();

//           if ( ! triggered ) {
//             triggered = true;
//             try {
//               setTimeoutX(
//                 function() {
//                   triggered = false;
//                   var args = argsToArray(lastArgs);
//                   lastArgs = null;
//                    var unsub = function unsubscribe() {
//                      unsubscribed = true;
//                    }
//                    args[1] = unsub;
//                    listener.apply(this, args);
//                 }, delay);
//             } catch(e) {
//               // TODO: Clean this up when we move EventService into the context.
//               arguments[1]();
//             }
//           }
//         };

//         if ( DEBUG ) f.toString = function() {
//           return 'MERGED(' + delay + ', ' + listener.$UID + ', ' + listener + ')';
//         };

//         return f;
//       }();
//     },

//     /**
//      * Merge all notifications occuring until the next animation frame.
//      * Only the last notification is delivered.
//      **/
//     // TODO: execute immediately from within a requestAnimationFrame
//     function framed(listener, opt_X) {
//       opt_X = opt_X || this.X;
//       var requestAnimationFrameX = ( opt_X && opt_X.requestAnimationFrame ) || requestAnimationFrame;

//       return function() {
//         var triggered    = false;
//         var unsubscribed = false;
//         var lastArgs     = null;

//         var f = function() {
//           lastArgs = arguments;

//           //TODO: unsub fix //if ( unsubscribed ) throw EventService.UNSUBSCRIBE_EXCEPTION;

//           if ( ! triggered ) {
//             triggered = true;
//             requestAnimationFrameX(
//               function() {
//                 triggered = false;
//                 var args = argsToArray(lastArgs);
//                 lastArgs = null;
//                 try {
//                   listener.apply(this, args);
//                 } catch (x) {
//                   //TODO: unsub fix //if ( x === EventService.UNSUBSCRIBE_EXCEPTION ) unsubscribed = true;
//                 }
//               });
//           }
//         };

//         if ( DEBUG ) f.toString = function() {
//           return 'ANIMATE(' + listener.$UID + ', ' + listener + ')';
//         };

//         return f;
//       }();
//     },

//     /** Decroate a listener so that the event is delivered asynchronously. **/
//     function async(listener, opt_X) {
//       return this.delay(0, listener, opt_X);
//     },

//     function delay(delay, listener, opt_X) {
//       opt_X = opt_X || this.X;
//       return function() {
//         var args = argsToArray(arguments);

//         // Is there a better way of doing this?
//         (opt_X && opt_X.setTimeout ? opt_X.setTimeout : setTimeout)( function() { listener.apply(this, args); }, delay );
//       };
//     },
//   ]
// });
}

// MODEL({
//   name: 'EventPublisher',
var EventPublisher = {

//   properties: [
    subs_: null, // inited to {} when first used
//   ],

//   methods: [
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
    /** Returns true if any listener exists for the given topic, or if no
     *  topic is specified returns true if a listener exists for the entire object.
     */
    hasListeners: function(opt_topic) {
      if ( ! opt_topic ) {
        // we have a subs_ object, and it has at least one entry
        return ( !! this.subs_ ) && ( this.hasDirectListeners_(this.subs_) );
      } else if ( this.subs_ ) {
        // check that each level of the topic exists, and there's a listener array at the end
        var hasWildcard = opt_topic[opt_topic.length - 1] == EventService.WILDCARD;
        var map = this.subs_;
        // TODO: change to loop, return true when the first direct listeners are found
        return opt_topic.every(function(topic) {
          if ( topic == EventService.WILDCARD ) {
            // if a wildcard is specified, find any listener at all
            return this.hasAnyListeners_(map);
          }
          map = map[topic]; // try to move down a level
          return !! map; // abort if not found
          // the final topic is either a wildcard or should have a listeners array:
        }.bind(this)) && ( hasWildcard || ( this.hasDirectListeners_(map) ) );
      }
      return false;
    },

//     /**
//      * Publish a notification to the specified topic.
//      *
//      * @return number of subscriptions notified
//      **/
//     function publish(topic) {
//       return this.subs_ ?
//         this.pub_(
//           this.subs_,
//           0,
//           topic,
//           this.appendArguments([this, topic, null], arguments, 1)) : // null: to be replaced with the unsub object
//         0;
//     },

//     /** Publish asynchronously. **/
//     function publishAsync(topic) {
//       var args = argsToArray(arguments);
//       var me   = this;

//       setTimeout( function() { me.publish.apply(me, args); }, 0);
//     },

//     /**
//      * Publishes a message to this object and all of its children.
//      * Objects/Protos which have children should override the
//      * standard definition, which is the same as just calling publish().
//      **/
//     function deepPublish(topic) {
//       return this.publish.apply(this, arguments);
//     },

//     /**
//      * Publish a message supplied by a factory function.
//      *
//      * This is useful if the message is expensive to generate and you
//      * don't want to waste the effort if there are no listeners.
//      *
//      * arg function fn which returns array
//      **/
//     function lazyPublish(topic, fn) {
//       if ( this.hasListeners(topic) ) return this.publish.apply(this, fn());

//       return 0;
//     },

    /** Subscribe to notifications for the specified topic. **/
    // TODO: Return subscription
    subscribe: function(topic, listener) {
      if ( ! this.subs_ ) this.subs_ = {};
      //console.log("Sub: ",this, listener);

      this.sub_(this.subs_, 0, topic, listener);
    },

//     /** Unsubscribe a listener from the specified topic. **/
//     function unsubscribe(topic, listener) {
//       if ( ! this.subs_ ) return;

//       this.unsub_(this.subs_, 0, topic, listener);
//     },

//     /** Unsubscribe all listeners from this service. **/
//     function unsubscribeAll() {
//       this.sub_ = {};
//     },


//     ///////////////////////////////////////////////////////
//     //                                            Internal
//     /////////////////////////////////////////////////////

//     function pub_(map, topicIndex, topic, msg) {
//       /**
//         map: topicMap, topicIndex: index into 'topic', topic: array of topic path
//         return: number of listeners published to
//        **/
//       var count = 0;

//       // There are no subscribers, so nothing to do
//       if ( map == null ) return 0;

//       if ( topicIndex < topic.length ) {
//         var t = topic[topicIndex];

//         // wildcard publish, so notify all sub-topics, instead of just one
//         if ( t == this.WILDCARD )
//           return this.notifyListeners_(topic, map, msg);

//         if ( t ) count += this.pub_(map[t], topicIndex+1, topic, msg);
//       }

//       count += this.notifyListeners_(topic, map[null], msg);

//       return count;
//     },

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

//     function unsub_(map, topicIndex, topic, listener) {
//       /**
//         map: topicMap, topicIndex: index into 'topic', topic: array of topic path
//         return: true iff there are no subscritions for this topic left
//       **/
//       if ( topicIndex == topic.length ) {
//         if ( ! map[null] ) return true;

//         var i = map[null].indexOf(listener);
//         if ( i == -1 ) {
//           // console.warn('phantom unsubscribe, size: ', map[null].length);
//         } else {
//           map[null] = map[null].spliceF(i, 1);
//         }

//         if ( ! map[null].length ) delete map[null];
//       } else {
//         var key = topic[topicIndex];

//         if ( ! map[key] ) return false;

//         if ( this.unsub_(map[key], topicIndex+1, topic, listener) )
//           delete map[key];
//       }
//       return Object.keys(map).length == 0;
//     },

//     /** @return true if the message was delivered without error. **/
//     function notifyListener_(topic, listener, msg) {
//          var unsub = function unsubscribe() {
//            this.unsubscribe(topic, listener);
//          }.bind(this);
//          msg[1] = unsub;
//          listener.apply(null, msg);
//          msg[1] = null; // TODO: maybe not the best way to communicate the unsub
//     },

//     /** @return number of listeners notified **/
//     function notifyListeners_(topic, listeners, msg) {
//       if ( listeners == null ) return 0;

//       if ( Array.isArray(listeners) ) {
//         for ( var i = 0 ; i < listeners.length ; i++ ) {
//           var listener = listeners[i];

//           this.notifyListener_(topic, listener, msg) )
//         }

//         return listeners.length;
//       }

//       var count = 0;
//       for ( var key in listeners ) {
//         count += this.notifyListeners_(topic, listeners[key], msg);
//       }
//       return count;
//     },

//     // convenience method to turn 'arguments' into a real array
//     function appendArguments (a, args, start) {
//       for ( var i = start ; i < args.length ; i++ ) a.push(args[i]);

//       return a;
//     }
//   }
// });
}


// /** Extend EventPublisher with support for dealing with property-change notification. **/
// MODEL({
//   name: 'PropertyChangePublisher',

//   extends: 'EventPublisher',

//   constants: {
//     /** Root for property topics. **/
//     PROPERTY_TOPIC: 'property'
//   },

//   methods: {
//     /** Create a topic for the specified property name. **/
//     propertyTopic: memoize1(function (property) {
//       return [ this.PROPERTY_TOPIC, property ];
//     }),

//     /** Indicate that a specific property has changed. **/
//     function propertyChange (property, oldValue, newValue) {
//       // don't bother firing event if there are no listeners
//       if ( ! this.subs_ ) return;

//       // don't fire event if value didn't change
//       if ( property != null && (
//         oldValue === newValue ||
//           (/*NaN check*/(oldValue !== oldValue) && (newValue !== newValue)) )
//          ) return;

//       this.publish(this.propertyTopic(property), oldValue, newValue);
//     },

//     function propertyChange_ (propertyTopic, oldValue, newValue) {
//       // don't bother firing event if there are no listeners
//       if ( ! this.subs_ ) return;

//       // don't fire event if value didn't change
//       if ( oldValue === newValue || (/*NaN check*/(oldValue !== oldValue) && (newValue !== newValue)) ) return;

//       this.publish(propertyTopic, oldValue, newValue);
//     },

//     /** Indicates that one or more unspecified properties have changed. **/
//     function globalChange () {
//       this.publish(this.propertyTopic(this.WILDCARD), null, null);
//     },

//     function addListener(listener) {
//       console.assert(listener, 'Listener cannot be null.');
//       // this.addPropertyListener([ this.PROPERTY_TOPIC ], listener);
//       this.addPropertyListener(null, listener);
//     },

//     function removeListener(listener) {
//       this.removePropertyListener(null, listener);
//     },

//     /** @arg property the name of the property to listen to or 'null' to listen to all properties. **/
//     function addPropertyListener(property, listener) {
//       this.subscribe(this.propertyTopic(property), listener);
//     },

//     function removePropertyListener(property, listener) {
//       this.unsubscribe(this.propertyTopic(property), listener);
//     },

// // TODO: needed? where to put it...
// //     /** Create a Value for the specified property. **/
// //     function propertyValue(prop) {
// //       if ( ! prop ) throw 'Property Name required for propertyValue().';
// //       var props = this.props_ || ( this.props_ = {} );
// //       return Object.hasOwnProperty.call(props, prop) ?
// //         props[prop] :
// //         ( props[prop] = PropertyValue.create(this, prop) );
// //     }
//   }
// });


exports.EventPublisher = EventPublisher;
exports.EventService = EventService;


