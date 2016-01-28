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

var Slot = {

  //properties:
  followers_: {}, // maps destinationObj -> listenerFn

  /** Check equality and interpret NaN to equal NaN, for proper change detection.
      TODO: replace with stdlib version. */
  equals: function(a, b) {
    return (a === b) || (a == b) || ((a !== a) && (b !== b));
  },

//     /** Internal. Manages follower list. By default triggers the listener.
//         @param opt_dontCallListener if true, does not trigger the listener. **/
//     function recordListener_(dst, listener, opt_dontCallListener) {
//       console.assert( ! this.followers_[dst], 'recordListener: duplicate follow');
//       this.followers_[dst] = listener;
//       this.addListener(listener);
//       if ( ! opt_dontCallListener ) listener();
//     },

//     /** Have the dstSlot listen to changes in this Slot and update
//         its value to be the same. **/
//     function addFollower(dstSlot) {
//       if ( ! dstSlot ) return;
//       this.recordListener(dstSlot, function () {
//         var sv = this.get();
//         var dv = dstSlot.get();

//         if ( ! this.equals(sv, dv) ) dstSlot.set(sv);
//       });
//     },


//     /** Have the dstSlot stop listening for changes to the srcSlot. **/
//     function removeFollower(dst) {
//       if ( ! dst ) return;
//       var listener = this.followers_[dst];
//       if ( listener ) {
//         delete this.followers_[dst];
//         this.removeListener(listener);
//       }
//     },


//     /**
//      * Maps Slots from one model to another.
//      * @param f maps Slots from srcSlot to dstSlot
//      */
//     function map(dstSlot, f) {
//       if ( ! dstSlot ) return;
//       this.recordListener(dstSlot, function () {
//         var s = f(this.get());
//         var d = dstSlot.get();

//         if ( ! equals(s, d) ) dstSlot.set(s);
//       });
//     },


//     /**
//      * Link the Slots of two models by having them follow each other.
//      * Initial Slot is copied from srcSlot to dstSlot.
//      **/
//     function link(dstSlot) {
//       this.addFollower(dstSlot);
//       dstSlot.addFollower(this);
//     },


//     /**
//      * Relate the Slots of two models.
//      * @param f maps 'this' to dstSlot
//      * @param fprime maps dstSlot to 'this'
//      * @param removeFeedback disables feedback
//      */
//     function relate(dstSlot, f, fprime, removeFeedback) {
//       if ( ! dstSlot ) return;

//       var feedback = false;

//       var l = function(sv, dv, f) { return function () {
//         if ( removeFeedback && feedback ) return;
//         var s = f(sv.get());
//         var d = dv.get();

//         if ( ! equals(s, d) ) {
//           feedback = true;
//           dv.set(s);
//           feedback = false;
//         }
//       }};

//       var l1 = l(this, dstSlot, f);
//       var l2 = l(dstSlot, this, fprime);

//       this.recordListener(this, dstSlot, l1, true);
//       this.recordListener(dstSlot, this, l2, true);

//       l1();
//     },

//     /** Unlink the Slots of two models by having them no longer follow each other. **/
//     function unlink(dstSlot) {
//       this.removeFollower(dstSlot);
//       dstSlot.removeFollower(this);
//     },

//     /** Cleans up any remaining followers.
//         TODO: is this how the object lifecycle should be implemented? */
//     function destroy() {
//       for(var key in this.followers_) {
//         this.removeListener(this.followers_[dst]);
//       }
//       this.followers_ = {};
//     }

}

exports.Slot = Slot;
