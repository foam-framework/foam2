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
//GLOBAL.console && GLOBAL.console.log("slot global", GLOBAL.X);


X.Slot = {
  __proto__: GLOBAL.X.PropertyChangePublisher,

  //properties:
  //followers_: {}, // maps destinationObj -> listenerFn
  //value_: null, // default storage

    /** Check equality and interpret NaN to equal NaN, for proper change detection.
        TODO: replace with stdlib version. */
    equals: function(a, b) {
      return (a === b) || (a == b) || ((a !== a) && (b !== b));
    },

    /** Internal. Manages follower list. By default triggers the listener.
        @param opt_dontCallListener if true, does not trigger the listener. **/
    recordListener_: function(dst, listener, opt_dontCallListener) {
      if ( ! this.followers_ ) this.followers_ = {};
      console.assert( ! this.followers_[dst], 'recordListener: duplicate follow');
      this.followers_[dst] = listener;
      this.addListener(listener);
      if ( ! opt_dontCallListener ) listener();
    },

    /** Returns the value stored in this Slot.
        Override to provide alternate value storage. */
    get: function() {
      return this.hasOwnProperty('value_') ? this.value_ : undefined;
    },
    /** Sets the value stored in this Slot.
        Override to provide alternate value storage. */
    set: function(val) {
      this.value_ = val;
      this.globalChange();
    },

    /** Have the dstSlot listen to changes in this Slot and update
        its value to be the same.
        @param dstSlot the slot to push updates into. **/
    addFollower: function(dstSlot) {
      if ( ! this.followers_ ) this.followers_ = {};
      if ( ! dstSlot ) return;
      var self = this;
      this.recordListener_(dstSlot, function () {
        var sv = self.get();
        var dv = dstSlot.get();

        if ( ! self.equals(sv, dv) ) dstSlot.set(sv);
      });
    },

    /** Have the dstSlot stop listening for changes to the srcSlot. **/
    removeFollower: function(dst) {
      if ( ! this.followers_ ) this.followers_ = {};
      if ( ! dst ) return;
      var listener = this.followers_[dst];
      if ( listener ) {
        delete this.followers_[dst];
        this.removeListener(listener);
      }
    },

    /**
     * Maps Slots from one model to another.
     * @param f maps Slots from srcSlot to dstSlot
     */
    map: function(dstSlot, f) {
      if ( ! dstSlot ) return;
      var self = this;
      this.recordListener_(dstSlot, function () {
        var s = f(self.get());
        var d = dstSlot.get();

        if ( ! self.equals(s, d) ) dstSlot.set(s);
      });
    },


    /**
     * Link the Slots of two models by having them follow each other.
     * Initial Slot is copied from srcSlot to dstSlot.
     **/
    link: function(dstSlot) {
      if ( ! dstSlot ) return;
      this.addFollower(dstSlot);
      dstSlot.addFollower(this);
    },


    /**
     * Relate the Slots of two models.
     * @param f maps 'this' to dstSlot
     * @param fprime maps dstSlot to 'this'
     * @param removeFeedback disables feedback
     */
    relate: function(dstSlot, f, fprime, removeFeedback) {
      if ( ! dstSlot ) return;

      var self = this;
      var feedback = false;

      var l = function(sv, dv, f) { return function () {
        if ( removeFeedback && feedback ) return;
        var s = f(sv.get());
        var d = dv.get();

        if ( ! self.equals(s, d) ) {
          feedback = true;
          dv.set(s);
          feedback = false;
        }
      }};

      var l1 = l(this, dstSlot, f);
      var l2 = l(dstSlot, this, fprime);

      this.recordListener_(dstSlot, l1, true);
      dstSlot.recordListener_(this, l2, true);

      l1();
    },

    /** Unlink the Slots of two models by having them no longer follow each other. **/
    unlink: function(dstSlot) {
      if ( ! dstSlot ) return;
      this.removeFollower(dstSlot);
      dstSlot.removeFollower(this);
    },

    /** Cleans up any remaining followers.
        TODO: is this how the object lifecycle should be implemented? */
    destroy: function() {
      if ( ! this.followers_ ) return;
      for(var key in this.followers_) {
        this.removeListener(this.followers_[key]);
      }
      this.followers_ = {};
    }

}

