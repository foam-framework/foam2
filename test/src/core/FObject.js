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

describe('copyFrom', function() {
  it('simple maps', function() {
    foam.CLASS({
      name: 'SomeClass',
      properties: [
        {
          name: 'a',
          value: 1
        },
        {
          name: 'b',
          expression: function(a) {
            return a * 2;
          }
        },
        {
          name: 'c'
        },
        {
          class: 'Boolean',
          name: 'd'
        }
      ]
    });

    var obj = SomeClass.create(undefined, foam.__context__);
    obj.copyFrom({
      a: 2,
      c: 3,
      d: 4
    });

    expect(obj.a).toBe(2);
    expect(obj.b).toBe(4);
    expect(obj.c).toBe(3);
    expect(obj.d).toBe(true);
  });

  it('same class', function() {
    foam.CLASS({
      name: 'SomeClass',
      properties: [
        {
          name: 'a',
          value: 1
        },
        {
          name: 'b',
          expression: function(a) {
            return a * 2;
          }
        },
        {
          name: 'c'
        },
        {
          name: 'd',
          expression: function(c) {
            return c + 2;
          }
        },
        {
          name: 'e',
          factory: function() {
            return {};
          }
        }
      ]
    });

    var obj = SomeClass.create({
      a: 2
    }, foam.__context__);

    var obj2 = SomeClass.create({
      c: 3
    }, foam.__context__);

    obj.copyFrom(obj2);

    // Default value not copied
    expect(obj2.a).toBe(1);
    expect(obj.a).toBe(2);

    // Expression value not copied
    expect(obj.hasOwnProperty('b')).toBe(false);
    expect(obj2.hasOwnProperty('b')).toBe(false);
    expect(obj.b).toBe(4);
    expect(obj2.b).toBe(2);

    expect(obj.c).toBe(3);
    expect(obj2.c).toBe(3);

    expect(obj.hasOwnProperty('d')).toBe(false);
    expect(obj.d).toBe(5);
    expect(obj2.d).toBe(5);

    // Factory was not run twice
    expect(obj.e).toBe(obj2.e);
  });

  it('different class', function() {
    foam.CLASS({
      name: 'ClassA',
      properties: [
        {
          name: 'a',
          value: 1
        },
        {
          name: 'b',
          expression: function(a) {
            return a * 2;
          }
        },
        {
          name: 'c'
        },
        {
          class: 'Boolean',
          name: 'd'
        }
      ]
    });

    foam.CLASS({
      name: 'ClassB',
      properties: [
        {
          name: 'c'
        },
        {
          name: 'd'
        },
        {
          name: 'e'
        }
      ]
    });

    var obj1 = ClassA.create({ a: 2, c: 4, d: false }, foam.__context__);
    var obj2 = ClassB.create({ c: 5, d: 'true', e: 6 }, foam.__context__);

    obj1.copyFrom(obj2);

    expect(obj1.a).toBe(2);
    expect(obj1.b).toBe(4);
    expect(obj1.c).toBe(5);
    expect(obj1.d).toBe(true);
    expect(obj1.e).toBe(undefined);
  });

  it('some unknown object', function() {
    foam.CLASS({
      name: 'SomeClass',
      properties: [
        {
          name: 'a',
          value: 1
        },
        {
          name: 'b',
          expression: function(a) {
            return a * 2;
          }
        },
        {
          name: 'c'
        },
        {
          class: 'Boolean',
          name: 'd'
        }
      ]
    });

    var SomeProto = {};
    var someObj = Object.create(SomeProto);

    someObj.a = 10;
    someObj.c = undefined;
    someObj.d = true;

    var obj = SomeClass.create({
      a: 1,
      c: 2,
      d: false
    }, foam.__context__);

    obj.copyFrom(someObj);

    expect(obj.a).toBe(10);

    // undefined values are not copied
    expect(obj.c).toBe(2);

    expect(obj.d).toBe(true);
  });
});

describe('FObject compare', function() {
  var someObj;

  beforeAll(function() {
    foam.CLASS({
      name: 'SomeClass',
      properties: [
        {
          name: 'a',
          value: 1
        }
      ]
    });
    someObj = SomeClass.create();
  });

  it('with undefined values', function() {
    expect(foam.util.compare(undefined, someObj)).toBe(-1);
    expect(foam.util.compare(someObj, undefined)).toBe(1);
  });

  it('with null values', function() {
    expect(foam.util.compare(null, someObj)).toBe(-1);
    expect(foam.util.compare(someObj, null)).toBe(1);
  });

  it('with boolean values', function() {
    expect(foam.util.compare(true, someObj)).toBe(-1);
    expect(foam.util.compare(someObj, true)).toBe(1);
    expect(foam.util.compare(false, someObj)).toBe(-1);
    expect(foam.util.compare(someObj, false)).toBe(1);
  });

  it('with empty arrays', function() {
    var emptyArr = [];
    expect(foam.util.compare(emptyArr, someObj)).toBe(-1);
    expect(foam.util.compare(someObj, emptyArr)).toBe(1);
  });

  it('with empty strings', function() {
    var emptyStr = "";
    expect(foam.util.compare(emptyStr, someObj)).toBe(-1);
    expect(foam.util.compare(someObj, emptyStr)).toBe(1);
  });

  it('with a function', function() {
    var lambda = function() { };
    expect(foam.util.compare(lambda, someObj)).toBe(-1);
    expect(foam.util.compare(someObj, lambda)).toBe(1);
  });

  it('with a date', function() {
    var epoch = new Date(0);
    expect(foam.util.compare(epoch, someObj)).toBe(-1);
    expect(foam.util.compare(someObj, epoch)).toBe(1);
  });
});
