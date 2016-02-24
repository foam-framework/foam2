
describe('FObject compareTo', function() {
  var a;
  var a2;
  var b;

  beforeEach(function() {
    foam.CLASS({
      name: 'CompA',
      package: 'test',
      properties: [ 'a', 'b' ]
    });
    foam.CLASS({
      name: 'CompB',
      package: 'test',
      properties: [ 'b' ]
    });
    a = test.CompA.create();
    a2 = test.CompA.create();
    b = test.CompB.create();
  });
  afterEach(function() {
    a = a2 = b = null;
  });

  it('returns zero for the same object', function() {
    expect(a.compareTo(a)).toEqual(0);
  });
  it('and equals works', function() {
    expect(a.equals(a)).toBe(true);
    expect(a.equals(b)).toBe(false);
    expect(a.equals(a2)).toBe(true);
  });
  it('returns zero for an instance of the same Model with the same properties', function() {
    // values not set yet
    expect(a.compareTo(a2)).toEqual(0);

    a.a = a2.a = 4;
    a.b = a2.b = 5;
    expect(a.compareTo(a2)).toEqual(0);
  });
  it('returns zero for an instance of the same Model with NaN properties', function() {
    a.a = a2.a = NaN;
    a.b = a2.b = NaN;
    expect(a.compareTo(a2)).toEqual(0);
  });
  it('returns 1 if the first property compared is greater', function() {
    a.a = 5; a2.a = 4; // this will be compared first
    a.b = 1; a2.b = 10; // this will not be compared
    expect(a.compareTo(a2)).toEqual(1);
  });
  it('returns -1 for a lesser prop, skips equal props', function() {
    a.a = 4; a2.a = 4; // this will be compared first but is equal
    a.b = 1; a2.b = 10; // this will be compared
    expect(a.compareTo(a2)).toEqual(-1);
  });
  it('returns non-zero for different models', function() {
    expect(a.compareTo(b)).toEqual(-1);
    expect(b.compareTo(a)).toEqual(1);
  });
});


describe('FObject diff', function() {
  var a;
  var b;

  beforeEach(function() {
    foam.CLASS({
      name: 'CompA',
      package: 'test',
      properties: [ 'a', 'b' ]
    });
    foam.CLASS({
      name: 'CompB',
      package: 'test',
      properties: [ 'b', 'c' ]
    });
    a = test.CompA.create();
    b = test.CompB.create();
  });
  afterEach(function() {
    a = b = null;
  });

  it('returns empty result for identical objects', function() {
    expect(a.diff(a)).toEqual({});
  });
  it('returns new value if undefined in base object', function() {
    b.b = 4;
    expect(a.diff(b)).toEqual({ b: 4 });
  });
  it('returns undefined if a base value is missing in other', function() {
    a.b = 4;
    expect(a.diff(b)).toEqual({ b: undefined });
  });
  it('returns only changed values from primary', function() {
    a.b = 'yes';
    b.b = 'no';
    b.c = 'maybe';
    expect(a.diff(b)).toEqual({ b: 'no' });
  });
  it('returns changed values not present in the other model', function() {
    a.a = 'yes';
    expect(a.diff(b)).toEqual({ a: undefined });
  });
  it('returns diff from an array value', function() {
    a.b = [ 4, 'hello', b ];
    b.b = ['hello', 99, 87, a];
    expect(a.diff(b)).toEqual({ b: { added: [99,87,a], removed: [4,b] } });
  });
});

describe('FObject hashCode', function() {
  var a;

  beforeEach(function() {
    foam.CLASS({
      name: 'CompA',
      package: 'test',
      properties: [ 'a', 'b' ]
    });
    a = test.CompA.create();
  });
  afterEach(function() {
    a = null;
  });

  it('regression 1: undefineds', function() {
    expect(a.hashCode()).toEqual(16337);
  });
  it('regression 2: strings and numbers', function() {
    a.a = 'this is a longer string!@';
    a.b = 998765876.78;
    expect(a.hashCode()).toEqual(-359267117);
  });
  it('regression 3: model instance', function() {
    a.a = test.CompA.create({ a: 4 });
    expect(a.hashCode()).toEqual(572756);
  });
});

describe('FObject clone', function() {
  var a;
  beforeEach(function() {
    foam.CLASS({
      name: 'CloneProperty',
      package: 'test',
      extends: 'foam.core.Property',
      methods: [
        function cloneProperty(value, map) {
          map[this.name] = value + 5;
        }
      ],
    });
    foam.CLASS({
      package: 'test',
      name: 'CompA',
      properties: [
        {
          name: 'ordinary'
        },
        {
          class: 'test.CloneProperty',
          name: 'special'
        }
      ]
    });

    a = test.CompA.create();
  });
  afterEach(function() {
    a = null;
  });

  it('clones primitive values', function() {
    a.ordinary = "some data";
    a.special = 77;

    var clone = a.clone();
    expect(clone.ordinary).toEqual(a.ordinary);
    expect(clone.special).toEqual(a.special + 5);

  });
  it('clones nested instances', function() {
    a.ordinary = test.CompA.create({ ordinary: [3,4,5], special: 88 });
    a.special = 77;

    var clone = a.clone();
    expect(clone.ordinary).not.toBe(a.ordinary); // not the same object
    expect(clone.ordinary.ordinary).toEqual([3,4,5]); // but equal
    expect(clone.ordinary.special).toEqual(88 + 5); // and went through cloneProperty()
    expect(clone.special).toEqual(a.special + 5);
  });



});
