// /**
//  * @license
//  * Copyright 2016 Google Inc. All Rights Reserved.
//  *
//  * Licensed under the Apache License, Version 2.0 (the "License");
//  * you may not use this file except in compliance with the License.
//  * You may obtain a copy of the License at
//  *
//  *     http://www.apache.org/licenses/LICENSE-2.0
//  *
//  * Unless required by applicable law or agreed to in writing, software
//  * distributed under the License is distributed on an "AS IS" BASIS,
//  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  * See the License for the specific language governing permissions and
//  * limitations under the License.
//  */

// TODO: tests. Refactored out of old event.js to contain the value binding code.

// var FunctionStack = {
//   function create() {
//     var stack = [false];
//     return {
//       stack: stack,
//       function push(f) { stack.unshift(f); },
//       function pop() { stack.shift(); },
//     };
//   }
// };


// var Value = {
//   __isValue__: true,
//   function isInstance(o) { return o && o.__isValue__; },
//   function follow(srcValue) { Events.follow(srcValue, this); }
// };

// var PropertyValue = {
//   __proto__: Value,
//   function create(obj, prop) {
//     var o = Object.create(this);
//     o.$UID = obj.$UID + '.' + prop;
//     o.obj  = obj;
//     o.prop = prop;
//     return o;
//   },

//   function get() { return this.obj[this.prop]; },

//   function set(val) { this.obj[this.prop] = val; },

//   // function asDAO() {
//   //   console.warn('ProperytValue.asDAO() deprecated.  Use property$Proxy instead.');
//   //   if ( ! this.proxy ) {
//   //     this.proxy = this.X.lookup('foam.dao.ProxyDAO').create({delegate: this.get()});
//   //     this.addListener(function() { proxy.delegate = this.get(); }.bind(this));
//   //   }
//   //   return this.proxy;
//   // },

//   get value() { return this.get(); },

//   set value(val) { this.set(val); },

//   function addListener(listener) { this.obj.addPropertyListener(this.prop, listener); },

//   function removeListener(listener) { this.obj.removePropertyListener(this.prop, listener); },

//   function toString () { return 'PropertyValue(' + this.prop + ')'; }
// };


// /** Static support methods for working with Events. **/
// MODEL({
//   name: 'Dynamic'

//   properties: [
//     /** Collection of all 'following' listeners. **/
//     {
//       name: 'listeners_',
//       factory: function() { return new WeakMap(); }
//     }
//   ],

//   methods: [
//     function recordListener(src, dst, listener, opt_dontCallListener) {
//       var srcMap = this.listeners_.get(src);
//       if ( ! srcMap ) {
//         srcMap = new WeakMap();
//         this.listeners_.set(src, srcMap);
//       }
//       console.assert( ! srcMap.get(dst), 'recordListener: duplicate follow');
//       srcMap.set(dst, listener);
//       src.addListener(listener);
//       if ( ! opt_dontCallListener ) listener();
//     },


//     function identity (x) { return x; },

//     /** Have the dstValue listen to changes in the srcValue and update its value to be the same. **/
//     function follow(srcValue, dstValue) {
//       if ( ! srcValue || ! dstValue ) return;

//       this.recordListener(srcValue, dstValue, function () {
//         var sv = srcValue.get();
//         var dv = dstValue.get();

//         if ( ! equals(sv, dv) ) dstValue.set(sv);
//       });
//     },


//     /** Have the dstValue stop listening for changes to the srcValue. **/
//     function unfollow(src, dst) {
//       if ( ! src || ! dst ) return;
//       var srcMap = this.listeners_.get(src);
//       if ( ! srcMap ) return;
//       var listener = srcMap.get(dst);
//       if ( listener ) {
//         srcMap.delete(dst);
//         src.removeListener(listener);
//       }
//     },


//     /**
//      * Maps values from one model to another.
//      * @param f maps values from srcValue to dstValue
//      */
//     function map(srcValue, dstValue, f) {
//       if ( ! srcValue || ! dstValue ) return;

//       this.recordListener(srcValue, dstValue, function () {
//         var s = f(srcValue.get());
//         var d = dstValue.get();

//         if ( ! equals(s, d) ) dstValue.set(s);
//       });
//     },


//     /**
//      * Link the values of two models by having them follow each other.
//      * Initial value is copied from srcValue to dstValue.
//      **/
//     function link(srcValue, dstValue) {
//       this.follow(srcValue, dstValue);
//       this.follow(dstValue, srcValue);
//     },


//     /**
//      * Relate the values of two models.
//      * @param f maps value1 to model2
//      * @param fprime maps model2 to value1
//      * @param removeFeedback disables feedback
//      */
//     function relate(srcValue, dstValue, f, fprime, removeFeedback) {
//       if ( ! srcValue || ! dstValue ) return;

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

//       var l1 = l(srcValue, dstValue, f);
//       var l2 = l(dstValue, srcValue, fprime);

//       this.recordListener(srcValue, dstValue, l1, true);
//       this.recordListener(dstValue, srcValue, l2, true);

//       l1();
//     },

//     /** Unlink the values of two models by having them no longer follow each other. **/
//     function unlink(value1, value2) {
//       this.unfollow(value1, value2);
//       this.unfollow(value2, value1);
//     },


//     //////////////////////////////////////////////////
//     //                                   FRP Support
//     //////////////////////////////////////////////////

//     /**
//      * Trap the dependencies of 'fn' and re-invoke whenever
//      * their values change.  The return value of 'fn' is
//      * passed to 'opt_fn'.
//      * @param opt_fn also invoked when dependencies change,
//      *        but its own dependencies are not tracked.
//      * @returns a cleanup object. call ret.destroy(); to
//      *        destroy the dynamic function and listeners.
//      */
//     function dynamicFn(fn, opt_fn, opt_X) {
//       var fn2 = opt_fn ? function() { opt_fn(fn()); } : fn;
//       var listener = EventService.framed(fn2, opt_X);
//       var propertyValues = [];
//       fn(); // Call once before capture to pre-latch lazy values
//       Events.onGet.push(function(obj, name, value) {
//         // Uncomment next line to debug.
//         // obj.propertyValue(name).addListener(function() { console.log('name: ', name, ' listener: ', listener); });
//         var l = obj.propertyValue(name);
//         if ( propertyValues.indexOf(l) == -1 ) {
//           obj.propertyValue(name).addListener(listener);
//           propertyValues.push(l);
//         }
//       });
//       var ret = fn();
//       Events.onGet.pop();
//       opt_fn && opt_fn(ret);
//       return {
//         function destroy() { // TODO(jacksonic): just return the function?
//           propertyValues.forEach(function(p) {
//             p.removeListener(listener);
//           });
//         }
//       };
//     },

//     function onSetStack.create(),
//     function onGetStack.create(),
//   ]
//   // ???: would be nice to have a removeValue method
//   // or maybe add an 'owner' property, combine with Janitor
// });

// // TODO: Janitor
// /*
//   subscribe(subject, topic, listener);
//   addCleanupTask(fn)

//   cleanup();

// */


