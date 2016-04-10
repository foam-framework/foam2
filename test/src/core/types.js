
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
  it('accepts strings and converts them into functions', function() {
    p.func = "return 55;"
    expect(p.func()).toEqual(55);
  });
  it('accepts strings including function() and converts them into functions', function() {
    p.func = "function\r\n(\n)\n\n\n { return 55; }"
    expect(p.func()).toEqual(55);
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

  it('is empty array by default', function() {
    expect(p.stringArray).toEqual([]);
  });
  it('accepts bare strings', function() {
    p.stringArray = "Hello";
    expect(p.stringArray).toEqual(['Hello']);
  });
  it('accepts comma separated strings', function() {
    p.stringArray = "Hello,Goodbye,Farewell";
    expect(p.stringArray).toEqual(['Hello','Goodbye','Farewell']);
  });
  it('accepts string in an array', function() {
    p.stringArray = [ "Hello", "I see", "Well" ];
    expect(p.stringArray).toEqual([ "Hello", "I see", "Well" ]);
  });
  it('puts other things into an array', function() {
    p.stringArray = 99;
    expect(p.stringArray).toEqual([ 99 ]);
    p.stringArray = 0;
    expect(p.stringArray).toEqual([ 0 ]);
    p.stringArray = null;
    expect(p.stringArray).toEqual([ ]);
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
