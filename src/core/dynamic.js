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

// See Slot.js for 'dynamic value' bindings, follow, etc.


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


