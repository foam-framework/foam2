describe('internal foam.LIB', function() {

  beforeEach(function() {
  });
  afterEach(function() {
  });

  it('applies constants', function() {
    foam.LIB({
        name: 'testLib',
        constants: {
          CONST: 'val'
        }
    });
    expect(foam.testLib.CONST).toEqual('val');
  });

});

describe('Object.$UID', function() {

  beforeEach(function() {
  });
  afterEach(function() {
  });

  it('is unique', function() {
      var o1 = {};
      var o2 = {};
      expect(o1.$UID).not.toEqual(o2.$UID);

      var o3 = {};
      expect(o1.$UID).not.toEqual(o3.$UID);
      expect(o2.$UID).not.toEqual(o3.$UID);
  });

});

describe('fn.memoize1', function() {

  beforeEach(function() {
  });
  afterEach(function() {
  });

  it('accepts a null argument', function() {
    var f = foam.fn.memoize1(function(arg) { return arg; });
    var r = f(null);
    expect(f(null)).toBe(r);
  });

});


describe('string.pad', function() {

  beforeEach(function() {
  });
  afterEach(function() {
  });

  it('pads left', function() {
    expect(foam.string.pad("wee", -6)).toEqual("   wee");
  });

});

describe('Number.compareTo', function() {

  beforeEach(function() {
  });
  afterEach(function() {
  });

  it('compares', function() {
    var n = new Number(3);
    expect(n.compareTo(3)).toEqual(0);
    expect(n.compareTo(1)).toEqual(1);
    expect(n.compareTo(6)).toEqual(-1);
  });

});
describe('String.compareTo', function() {

  beforeEach(function() {
  });
  afterEach(function() {
  });

  it('compares', function() {
    var n = new String("bbb");
    expect(n.compareTo("bbb")).toEqual(0);
    expect(n.compareTo("aa")).toEqual(1);
    expect(n.compareTo("ccc")).toEqual(-1);
  });

});


describe('Array diff', function() {
  var x;
  var y;
  
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
    x = test.CompA.create();
    y = test.CompB.create();
  });
  afterEach(function() {
    x = y = null;
  });
  
  it('reports no change correctly', function() {
    var a = ['a', 't', x];
    expect(a.diff(a).added).toEqual([]);
    expect(a.diff(a).removed).toEqual([]);

    var b = [];
    expect(b.diff(b).added).toEqual([]);
    expect(b.diff(b).removed).toEqual([]);
  });
  it('finds added primitive elements', function() {
    var a = ['a', 't'];
    var b = ['a', 'r', 't'];
    expect(a.diff(b).added).toEqual(['r']);
  });
  it('finds removed primitive elements', function() {
    var a = ['a', 't'];
    var b = ['a', 'r', 't'];
    expect(b.diff(a).removed).toEqual(['r']);
  });
  it('finds added object elements', function() {
    var a = [x, 4];
    var b = [y, x, 4];
    expect(a.diff(b).added).toEqual([y]);
  });
  it('finds removed object elements', function() {
    var a = [y, 4];
    var b = [y, x, 4];
    expect(b.diff(a).removed).toEqual([x]);
  });
  it('finds swapped elements', function() {
    var a = [y, 4, 8];
    var b = [4, x, 'hello'];
    expect(a.diff(b).added).toEqual([x, 'hello']);
    expect(a.diff(b).removed).toEqual([y, 8]);
  });
  it('treats multiple copies of an element as separate items', function() {
    var a = [4,5,6,7,8,8];
    var b = [4,4,4,4,8,8];
    expect(a.diff(b).added).toEqual([4,4,4]);
    expect(a.diff(b).removed).toEqual([5,6,7]);
  });
});
