/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KM.IND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
jasmine.DEFAULT_TIMEOUT_INTERVAL = 240000;

if ( ! typeof performance !== 'undefined' ) performance = {
  now: function() { return Date.now(); }
};



describe("Foam.bind vs. native bind", function() {
  var DEBUG = false;
  var oldRandom;
  var rseed;

  beforeEach(function() {
    // make runs consistent with fake random()
    rseed = 1;
    function random() {
      var x = Math.sin(rseed++) * 10000;
      return x - Math.floor(x);
    }
    oldRandom = Math.random;
    Math.random = random;

  });
  afterEach(function() {
    Math.random = oldRandom;
  });

  it("calling", function() {

    foam.testing.test("Native bind call 10000000", function() {
      var self = { value: 99 };
      var testFunc = function(p) {
        return p * this.value;
      }
      testFunc.bind(self);

      var result;
      for ( var i = 0; i < 10000000; i++ ) {
        result = testFunc(i);
      }
      return result;
    });

    foam.testing.test("Foam bind call 10000000", function() {
      var self = { value: 99 };
      var testFunc = function(p) {
        return p * this.value;
      }
      foam.Function.bind(testFunc, self);

      var result;
      for ( var i = 0; i < 10000000; i++ ) {
        result = testFunc(i);
      }
      return result;
    });
  });


  it("bind()ing", function() {

    foam.testing.test("Native bind() 1000000", function() {
      var result;
      for ( var i = 0; i < 1000000; i++ ) {
        var self = { i: 6 };
        var testFunc = (function(iVal) { return function(p) {
          return p * this[iVal];
        }})(i);
        testFunc.bind(self);
        result = testFunc(i);
      }
      return result;
    });

    foam.testing.test("Foam bind() 1000000", function() {
      var result;
      for ( var i = 0; i < 1000000; i++ ) {
        var self = { i: 6 };
        var testFunc = (function(iVal) { return function(p) {
          return p * this[iVal];
        }})(i);
        foam.Function.bind(testFunc, self);
        result = testFunc(i);
      }
      return result;
    });
  });

  it("calling after 4 binds", function() {

    foam.testing.test("Native bind x4 call 10000000", function() {
      var self = { value: 99 };
      var testFunc = function(p, a,b,c,d) {
        return p * this.value + a+b+c+d;
      }
      testFunc.bind(self);
      for ( var b = 0; b < 4; b++ ) {
        testFunc.bind(b);
      }

      var result;
      for ( var i = 0; i < 10000000; i++ ) {
        result = testFunc(i);
      }
      return result;
    });

    foam.testing.test("Foam bind x4 call 10000000", function() {
      var self = { value: 99 };
      var testFunc = function(p, a,b,c,d) {
        return p * this.value + a+b+c+d;
      }
      foam.Function.bind(testFunc, self);
      for ( var b = 0; b < 4; b++ ) {
        foam.Function.bind(testFunc, b);
      }

      var result;
      for ( var i = 0; i < 10000000; i++ ) {
        result = testFunc(i);
      }
      return result;
    });
  });

  it("calling after quad argument bind", function() {

    foam.testing.test("Native quad bind call 10000000", function() {
      var self = { value: 99 };
      var testFunc = function(p, a,b,c,d) {
        return p * this.value + a+b+c+d;
      }
      testFunc.bind(self, 1, 2, 3);

      var result;
      for ( var i = 0; i < 10000000; i++ ) {
        result = testFunc(i);
      }
      return result;
    });

    foam.testing.test("Foam quad bind call 10000000", function() {
      var self = { value: 99 };
      var testFunc = function(p, a,b,c,d) {
        return p * this.value + a+b+c+d;
      }
      foam.Function.bind(testFunc, self, 1, 2, 3);

      var result;
      for ( var i = 0; i < 10000000; i++ ) {
        result = testFunc(i);
      }
      return result;
    });
  });
});
