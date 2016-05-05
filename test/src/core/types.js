
var createTestProperties = function createTestProperties() {
  if ( ! test.PropTypeTester ) {
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
  if ( ! test.DateTypeTester ) {
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

describe('Class property', function() {
  var p;

  beforeEach(function() {
    p = createTestProperties();
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

describe('StringArray', function() {
  var p;
  var oldAssert;

  beforeEach(function() {
    p = createTestProperties();
    oldAssert = foam.core.FObject.prototype.assert;
    foam.core.FObject.prototype.assert = function(c) { if ( ! c ) throw Array.from(arguments); }
  });
  afterEach(function() {
    p = null;
    foam.core.FObject.prototype.assert = oldAssert;
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
    expect(p.stringArray).toEqual([]);
  });
  it('accepts string in an array', function() {
    p.stringArray = [ "Hello", "I see", "Well" ];
    expect(p.stringArray).toEqual([ "Hello", "I see", "Well" ]);
  });
});

var createReferenceTestProperties = function createReferenceTestProperties() {
  if ( ! test.ReferenceTypeTester ) {
    foam.CLASS({
      package: 'test',
      name: 'Sample',
      properties: [
        'id',
      ]
    });

    foam.CLASS({
      name: 'ReferenceTypeTester',
      package: 'test',

      properties: [
        {
          class: 'Reference',
          name: 'ref',
          of: 'test.Sample',
        },
        {
          class: 'ReferenceArray',
          name: 'refArray',
        },
      ]
    });

    foam.CLASS({
      package: 'test',
      name: 'SampleDAOExporter',
      requires: [
        'foam.dao.ArrayDAO',
        'test.ReferenceTypeTester',
      ],
      exports: [ 'SampleDAO' ],
      properties: [
        {
          name: 'SampleDAO',
          factory: function() {
            return this.ArrayDAO.create({ of: test.Sample });
          }
        },
        {
          name: 'tester',
          factory: function() {
            return this.ReferenceTypeTester.create();
          }
        }
      ]
    });
  }

  return test.SampleDAOExporter.create();
}



describe('ReferenceArray', function() {
  var p;

  beforeEach(function() {
    p = createReferenceTestProperties();
  });
  afterEach(function() {
    p = null;
  });

  it('is empty array by default', function() {
    expect(p.tester.refArray).toEqual([]);
  });
});

describe('Reference', function() {
  var p;

  beforeEach(function() {
    p = createReferenceTestProperties();
  });
  afterEach(function() {
    p = null;
  });

  it('stores an id', function() {
    p.tester.ref = "123456";
    expect(p.tester.ref).toEqual("123456");
    expect(p.tester.ref$.get()).toEqual("123456"); // slot's normal getter
  });
  it('looks up by id', function(done) {
    p.tester.ref = "123456";
    p.SampleDAO.put(test.Sample.create({ id: "123456" }));

    p.tester.ref$.asDAO.select().then(function(s) {
      expect(s.a.length).toEqual(1);
      expect(s.a[0].id).toEqual("123456");
      done();
    });
  });
});








