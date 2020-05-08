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

var createTestProperties = function createTestProperties() {
  if ( ! foam.lookup('test.PropTypeTester', true) ) {
    foam.CLASS({
      name: 'PropTypeTester',
      package: 'test',

      properties: [
        {
          class: 'Date',
          name: 'date',
        },
        {
          class: 'DateTime',
          name: 'dateTime',
        },
        {
          class: 'Long',
          name: 'long',
        },
        {
          class: 'Float',
          name: 'float',
        },
        {
          class: 'Function',
          name: 'func',
        },
        {
          class: 'Blob',
          name: 'blob',
        },
        {
          class: 'StringArray',
          name: 'stringArray',
        },
        {
          class: 'Class',
          name: 'class',
        }
        // TODO: other types, as they gain testable functionality
      ]
    });
  }

  return test.PropTypeTester.create(undefined, foam.__context__);
}
var createDateTestProperties = function createDateTestProperties() {
  if ( ! foam.lookup('test.DateTypeTester', true) ) {
    foam.CLASS({
      name: 'DateTypeTester',
      package: 'test',

      properties: [
        {
          class: 'Date',
          name: 'date',
        },
        {
          class: 'DateTime',
          name: 'dateTime',
        }
      ]
    });
  }
  return test.DateTypeTester.create(undefined, foam.__context__);
}

describe('Date', function() {
  var p;
  var p2;

  beforeEach(function() {
    p = createDateTestProperties();
    p2 = createDateTestProperties();
  });
  afterEach(function() {
    p = null;
    p2 = null;
  });

  it('accepts dates', function() {
    var d = new Date();
    p.date = d;
    expect(p.date).toBe(d);
  });
  it('accepts numbers', function() {
    p.date = 3434;
    expect(p.date).toEqual(new Date(3434));
  });
  it('accepts valid date strings', function() {
    dateStr = "Wed Dec 31 1987 19:00:03 GMT-0500 (EST)";
    p.date = dateStr;
    expect(p.date).toEqual(new Date(dateStr));
  });
  // Assigning invalid date is no longer throw.
  // Please see foam.core.Date for detail.
  it('not throws on invalid date strings', function() {
    var dateStr = "d ";
    expect(function() { p.date = dateStr; }).not.toThrow();
  });
  it('compares', function() {
    p.date = 55555;
    p2.date = 88888;

    expect(p.compareTo(p2)).toEqual(-1);
    expect(p2.compareTo(p)).toEqual(1);
  });
  it('compares when undefined', function() {
    p2.date = 88888;

    expect(p.compareTo(p2)).toEqual(-1);
    expect(p2.compareTo(p)).toEqual(1);
  });
  it('compares when undefined2', function() {
    p.date = 55555;

    expect(p.compareTo(p2)).toEqual(1);
    expect(p2.compareTo(p)).toEqual(-1);
  });
  it('compares when equal', function() {
    expect(p.compareTo(p2)).toEqual(0);
    expect(p2.compareTo(p)).toEqual(0);

    p.date =  55555;
    p2.date = 55555;
    expect(p.compareTo(p2)).toEqual(0);
    expect(p2.compareTo(p)).toEqual(0);
    expect(p.equals(p2)).toEqual(true);

  });
});

describe('Float', function() {
  var p;

  beforeEach(function() {
    p = createTestProperties();
  });
  afterEach(function() {
    p = null;
  });

  it('accepts ints', function() {
    p.float = 5;
    expect(p.float).toEqual(5);
  });
  it('accepts floats', function() {
    p.float = 456.456332;
    expect(p.float).toEqual(456.456332);
  });
  it('accepts negative floats', function() {
    p.float = -3.948474;
    expect(p.float).toEqual(-3.948474);
  });
  it('accepts string floats', function() {
    p.float = "-3.948474";
    expect(p.float).toEqual(-3.948474);
  });
  it('defaults to 0 if falsey', function() {
    p.float = null;
    expect(p.float).toEqual(0);
    p.float = '';
    expect(p.float).toEqual(0);
    p.float = undefined;
    expect(p.float).toEqual(0);
  });

  it('has different hashes for f1 != f2, round(f1) == round(f2)', function() {
    // Hash code should be deterministic.
    expect(foam.util.hashCode(p)).toBe(foam.util.hashCode(p));
    p.float = 0.01;
    var hashPsFloat0_01 = foam.util.hashCode(p);
    p.float = 0.001;
    var hashPsFloat0_001 = foam.util.hashCode(p);
    expect(hashPsFloat0_01).not.toEqual(hashPsFloat0_001);
  });
});

describe('Function', function() {
  var p;

  beforeEach(function() {
    p = createTestProperties();
  });
  afterEach(function() {
    p = null;
  });

  it('defaults to a function', function() {
    expect(typeof p.func).toEqual('function');
    p.func();
  });
  it('accepts functions', function() {
    p.func = function() { return 55; }
    expect(p.func()).toEqual(55);
  });
  it('rejects non functions', function() {
    expect(function() {
      p.func = 'asdlfkjalskdjf';
    }).toThrow();
  });
});


describe('StringArray', function() {
  var p;

  beforeEach(function() {
    p = createTestProperties();
  });
  afterEach(function() {
    p = null;
  });

  it('setting an array to a number throws an exception', function() {
    expect(function() { p.stringArray = 42; }).toThrow();
  });
  it('setting an array to null is permitted', function() {
    p.stringArray = null;
    expect(p.stringArray).toBe(null);
  });
  it('setting an array to an object throws an exception', function() {
    expect(function() { p.stringArray = {}; }).toThrow();
  });
  it('is empty array by default', function() {
    expect(p.stringArray).toEqual([]);
  });
  it('accepts string in an array', function() {
    p.stringArray = [ "Hello", "I see", "Well" ];
    expect(p.stringArray).toEqual([ "Hello", "I see", "Well" ]);
  });
  it('converts elements to strings', function() {
    var d = new Date();
    var golden = '' + d;

    p.stringArray = [
      { a: 1 },
      2,
      true,
      d,
      'hello'
    ];

    expect(p.stringArray).toEqual([
      '[object Object]',
      '2',
      'true',
      golden,
      'hello'
    ]);
  });
});

describe('Class property', function() {
  var p;

  beforeEach(function() {
    p = createTestProperties();
    createDateTestProperties();
  });
  afterEach(function() {
    p = null;
  });

  it('is undefined by default', function() {
    expect(p.class).toBeUndefined();
  });

  it('stores a given model instance', function() {
    p.class = test.DateTypeTester;
    expect(p.class).toBe(test.DateTypeTester);
  });
  it('looks up a model from a string name', function() {
    p.class = 'test.DateTypeTester';
    expect(p.class).toBe(test.DateTypeTester);
  });
  it('accepts undefined', function() {
    p.class = 'test.DateTypeTester';
    expect(p.class).toBe(test.DateTypeTester);

    p.class = undefined;
    expect(p.class).toBeUndefined();
  });

});
