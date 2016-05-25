
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
          class: 'Reference',
          name: 'reference',
        },
        {
          class: 'StringArray',
          name: 'stringArray',
        },
        {
          class: 'ReferenceArray',
          name: 'referenceArray',
        },
        {
          class: 'Class',
          name: 'class',
        }
        // TODO: other types, as they gain testable functionality
      ]
    });
  }

  return test.PropTypeTester.create();
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
        },
      ]
    });
  }
  return test.DateTypeTester.create();
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
  it('accepts invalid date strings, retains invalidity', function() {
    dateStr = "d ";
    p.date = dateStr;
    expect(p.date.toUTCString()).toEqual((new Date(dateStr)).toUTCString());
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
  it('setting an array to null throws an exception', function() {
    expect(function() { p.stringArray = null; }).toThrow();
  });
  it('setting an array to an object throws an exception', function() {
    expect(function() { p.stringArray = {}; }).toThrow();
  });
  it('is empty array by default', function() {
    expect(p.stringArray).toEqual(undefined);
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

describe('ReferenceArray', function() {
  var p;

  beforeEach(function() {
    p = createTestProperties();
  });
  afterEach(function() {
    p = null;
  });

  it('is empty array by default', function() {
    expect(p.referenceArray).toEqual([]);
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
