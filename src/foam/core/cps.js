/**
 * @license
 * Copyright 2018 The FOAM Contributors
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

/**
   Continuation Passing Style (CPS) function combinators and
   support library.

   Continuation Passing Style is a means of unifying asynchronous and
   synchronous functions by passing the work to do next (the
   continuatiuon) as a parameter to the function in question, rather
   than returning from that function.

   Since the next computation is passed as a parameter, a CPS style
   function is free to call that continuation synchronously when it is
   done its work, or it can hold on to it and call it asynchronously
   at a later time, the calling convention remains the same when
   dealing with synchronous or asynchronous functions.

   By convention CPS style functions take a first parameter 'then'
   which is the next work to do after being completed.  The second
   parameter 'abort' is called when an exception occurs.

   Example:

   // A simple CPS-style function which greets the given name
   // and then runs the continuation.
   function greet(then, abort, name) {
     var message = document.createTextNode("Hello " + name + "!");
     var container = document.createElement('span');

     container.appendChild(message);
     document.body.appendChild(container);

     then();
   }

   // Use 'with' to save typing foam.cps.* over and over.
   with ( foam.cps ) {
     // nop is a contination which does nothing.
     greet(nop, nop, "Adam");
   }

   // A slightly more complex CPS style function which
   // retrieves a name via an input element and then calls the
   // continuation.
   function getName(then, abort) {
     var e = document.createElement('input');
     e.setAttribute('type', 'text');
     e.addEventListener('change', function() {
       var name = e.value;
       e.remove();
       then(name);
     });
     document.body.appendChild(e);
   }

   with ( foam.cps ) {
     // Here we call getName and the continuation we pass it is
     // a call to greet().
     getName(function(name) { greet(nop, nop, name); }, nop);
   }

   // The foam.cps library provides combinators to make examples like
   // the one above more conventional looking
   with ( foam.cps ) {
     // 'compose' combintes two CPS-style functions into a single CPS-style function.
     // The continuation of the second parameter is the first paramter.
     // As a result, calls to func(nop, nop) now prompt for a name and then
     // greet that name.
     var func = compose(greet, getName);
     func(nop, nop);
   }
 */
foam.LIB({
  name: 'foam.cps',

  methods: [
    function compose(a, b) {
      return function(then, abort) {
        b(function(v) {
          a(then, abort, v);
        }, abort);
      };
    },

    function seq() {
      return Array.from(arguments).reduce(function(a, b) {
        return function(then, abort) {
          a(function() { b(then, abort); })
        };
      });
    },

    function nop() {}
  ]
});
