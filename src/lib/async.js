/*
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

/**
Async functions compose other asynchronous functions that return promises.

<p>One key to using these functions is to note that they return a function
that does the real work, so calling foam.async.sequence(myFuncArray),
for instance, doesn't create a promise or call any of the functions passed
to it. It instead sets up and returns a function that will return a promise
and evaluate arguments as needed.

<p>To use the returned function, pass it to a Promise.then call:
<pre>Promise.resolve().then(foam.async.sequence( [ fn1, fn2 ] ));</pre>
<p>Or create a new promise:
<pre>var p = new Promise(foam.async.sequence( [ fn1, fn2 ] ));</pre>

<p>Async functions can also be nested:
<pre>
var seq = foam.async.sequence([
  foam.async.log("Starting..."),
  foam.async.repeat(10, foam.async.sequence([
    function(i) { console.log("iteration", i); }),
    foam.async.sleep(1000)
  ])
]);
Promise.resolve().then(seq).then(foam.async.log("Done!"));
</pre>
 */
foam.LIB({
  name: 'foam.async',

  methods: [
    /** Takes an array of functions (that may return a promise) and runs
      them one after anther. Functions that return a promise will have that
      promise chained, such that the next function will not run until the
      previous function's returned promise is resolved.

      <p>Errors are not handled, so chain any desired error handlers
      onto the promise returned.

      <p>You can use sequence's returned function directly in a then call:
      <pre>promise.then(foam.async.sequence(...));</pre>
      <p>Or call it directly:
      <pre>(foam.async.sequence(...))().then(...);</pre> */
    function sequence(
      /* array // An array of functions that return Promises */ s
      /* function // A function that returns a promise that will
                     resolve after the last function's return is resolved. */) {
      return function() {
        if ( ! s.length ) return Promise.resolve();

        var p = Promise.resolve();
        for ( var i = 0; i < s.length; ++i ) {
          p = p.then(s[i]);
        }
        return p;
      }
    },

    /** Takes a function (that may return a promise) and runs it multiple
      times. A function that returns a promise will have that
      promise chained, such that the next call will not run until the
      previous call's returned promise is resolved. The function passed in
      will be called with one argument, the number of the iteration, from
      0 to times - 1.

      <p>Errors are not handled, so chain any desired error handlers
      onto the promise returned.

      <p>You can use repeat's returned function directly in a then call:
      <pre>promise.then(foam.async.repeat(...));</pre>
      <p>Or call it directly:
      <pre>(foam.async.repeat(...))().then(...);</pre> */
    function repeat(
      /* number // number of times to repeat in sequence */ times,
      /* function // that returns a Promise */ fn
      /* function // A function that returns a Promise that will resolve
                     after the last repetition's return resolves */) {
      return function() {
        var p = Promise.resolve();
        var n = 0;
        for ( var i = 0; i < times; ++i ) {
          p = p.then(function() { return fn(n++); });
        }
        return p;
      };
    },

    /**
      Takes a function (that may return a promise) and runs it multiple
      times in parallel. A function that returns a promise will have that
      promise chained, such that the entire group will not resolve until
      all returned promises have resolved (as in the standard Promise.all);
      The function passed in
      will be called with one argument, the number of the iteration, from
      0 to times - 1.

      <p>Errors are not handled, so chain any desired error handlers
      onto the promise returned.

      <p>You can use repeatParallel's returned function directly in a then call:
      <pre>promise.then(foam.async.repeatParallel(...));</pre>
      <p>Or call it directly:
      <pre>(foam.async.repeatParallel(...))().then(...);</pre>
    */
    function repeatParallel(
      /* number // number of times to repeat in parallel */ times,
      /* function // that returns a Promise */ fn
      /* function // A function that returns a Promise that will resolve
                     after every repetition's return resolves */) {
      return function() {
        var promises = [];
        for ( var i = 0; i < times; ++i ) {
          promises[i] = fn(i); // TODO: what if not returned a promise?
        }
        return Promise.all(promises);
      };
    },

    /** Returns a function you can pass to a .then call, or other foam.async
      functions. Takes variable arguments that are passed to console.log. */
    function log() {
      var args = arguments;
      return function() {
        console.log.apply(console, args);
        return Promise.resolve();
      };
    },

    /** Returns a function that returns a promise that delays by the given
      time before resolving. */
    function sleep(/* number // milliseconds to delay */ time) {
      return function() {
        return new Promise(function(resolve, reject) {
          setTimeout(function() { resolve(); }, time);
        });
      };
    }
  ]
});
