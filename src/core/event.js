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

CLASS({
  name: 'EventPublisher',

  properties: [
    {
      name: 'subs_',
      defaultValue: null, // inited to {} when first used
    },
  ],

  methods: [
    /** Returns true if any listener exists for the given topic, or if no
     *  topic is specified returns true if a listener exists for the entire object.
     */
    function hasListeners(opt_topic) {
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
          if ( topic == foam.events.WILDCARD ) {
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
    function publish(topic) {
      return this.subs_ ?
        this.pub_(
          this.subs_,
          0,
          topic,
          foam.fn.appendArguments([this, topic, null], arguments, 1)) : // null: to be replaced with the unsub object
        0;
    },

    /** Publish asynchronously. **/
    function publishAsync(topic) {
      var args = foam.fn.argsToArray(arguments);
      var self = this;
      setTimeout( function() { self.publish.apply(self, args); }, 0);
    },

    /**
     * Publishes a message to this object and all of its children.
     * Objects/Protos which have children should override the
     * standard definition, which is the same as just calling publish().
     **/
    function deepPublish(topic) {
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
    function lazyPublish(topic, fn) {
      if ( this.hasListeners(topic) ) return this.publish.apply(this, fn());
      return 0;
    },

    /** Subscribe to notifications for the specified topic. **/
    // TODO: Return subscription
    function subscribe(topic, listener) {
      if ( ! this.subs_ ) this.subs_ = {};
      this.sub_(this.subs_, 0, topic, listener);
    },

    /** Unsubscribe a listener from the specified topic. **/
    function unsubscribe(topic, listener) {
      if ( ! this.subs_ ) return;
      this.unsub_(this.subs_, 0, topic, listener);
    },

    /** Unsubscribe all listeners from this service. **/
    function unsubscribeAll() {
      this.subs_ = {};
    },


//     ///////////////////////////////////////////////////////
//     //                                            Internal
//     /////////////////////////////////////////////////////

    function pub_(map, topicIndex, topic, msg) {
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
        if ( t == foam.events.WILDCARD ) {
          return this.notifyListeners_(topic, map, msg, topic.slice(0, topicIndex-1));
        }
        if ( t ) count += this.pub_(map[t], topicIndex+1, topic, msg);
      }
      count += this.notifyListeners_(topic, map[null], msg, topic);
      return count;
    },

    function sub_(map, topicIndex, topic, listener) {
      if ( topicIndex == topic.length ) {
        if ( ! map[null] ) map[null] = [];
        map[null].push(listener);
      } else {
        var key = topic[topicIndex];

        if ( ! map[key] ) map[key] = {};

        this.sub_(map[key], topicIndex+1, topic, listener);
      }
    },

    function unsub_(map, topicIndex, topic, listener) {
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
    function notifyListener_(topic, listener, msg, pathToListener) {
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
    function notifyListeners_(topic, listeners, msg, pathToListener) {
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
    function hasAnyListeners_(map) {
      for ( var key in map ) {
        subMap = map[key];
        return this.hasDirectListeners_(subMap) || this.hasAnyListeners_(subMap);
      }
    },

    /** Internal. Returns true if the given subs_ has direct listeners in its null key. */
    function hasDirectListeners_(map) {
      return !! ( map[null] && map[null].length );
    },
  ],
});


// /** Extend EventPublisher with support for dealing with property-change notification. **/
CLASS({
  name: 'PropertyChangePublisher',
  extends: 'EventPublisher',

  constants: [
    /** Root for property topics. **/
    { name: 'PROPERTY_TOPIC', value: 'property' },
  ],

  methods: [
    /** Create a topic for the specified property name.
      TODO: re-add memoize1 when available */
    /*memoize1(*/function propertyTopic(property) {
      return property ? [ this.PROPERTY_TOPIC, property ] : [ this.PROPERTY_TOPIC ];
    }/*)*/,

    /** Indicate that a specific property has changed.
        @param property the name of the property that has changed.
        @param oldValue the previous value
        @param newValue the new (current) value */
    function propertyChange(property, oldValue, newValue) {
      this.propertyChange_(this.propertyTopic(property), oldValue, newValue);
    },

    /** Internal. Indicate that a specific property has changed.
        @pararm propertyTopic the topic array for the property. */
    function propertyChange_(propertyTopic, oldValue, newValue) {
      // don't bother firing event if there are no listeners
      if ( ! this.subs_ ) return;

      // don't fire event if value didn't change
      if ( oldValue === newValue ||
           ((oldValue !== oldValue) && (newValue !== newValue)) /*NaN check*/
         ) return;
      this.publish(propertyTopic, oldValue, newValue);
    },

    /** Indicates that one or more unspecified properties have changed. **/
    function globalChange() {
      this.publish(this.propertyTopic(foam.events.WILDCARD), null, null);
    },

    /** Adds a listener for all property changes. **/
    function addListener(listener) {
      // TODO: throw exception?
      console.assert(listener, 'Listener cannot be null.');
      this.addPropertyListener(null, listener);
    },

    /** Removes a listener for all property changes. **/
    function removeListener(listener) {
      this.removePropertyListener(null, listener);
    },

    /** @param property the name of the property to listen to or 'null'
        to listen to all properties. **/
    function addPropertyListener(property, listener) {
      this.subscribe(this.propertyTopic(property), listener);
    },

    /** @param property the name of the property listened to or 'null'
        to remove an all-properties listener. **/
    function removePropertyListener(property, listener) {
      this.unsubscribe(this.propertyTopic(property), listener);
    },

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
  ],
});

