describe('coverage for debugging helpers', function() {
  it('covers describe()', function() {
    var p = foam.core.Property.create({});
    p.describe();
    p.cls_.describe();
  });
});


function makeTestFn() {
  foam.CLASS({  name: 'TypeA' });
  foam.CLASS({  name: 'TypeB' });
  foam.CLASS({  name: 'TypeBB', extends: 'TypeB' });
  foam.CLASS({  name: 'package.TypeC' });
  foam.CLASS({  name: 'RetType' });
  return function test(/* TypeA // docs for, pA */ paramA, /*TypeB?*/ paramB , /* package.TypeC*/ paramC, noType /* RetType */ ) {
    return (RetType.create());
  }
}
function makePrimitiveTestFn() { // multiline parsing, ha
return function(/* string */ str, /*boolean*/ bool ,
  /* function*/ func, /*object*/obj, /* number */num, /* array*/ arr ) {
    return (true);
  }
}

describe('foam.types.getFunctionArgs', function() {
  var fn;

  beforeEach(function() {
    fn = makeTestFn();
  });
  afterEach(function() {
    fn = null;
  });

  it('returns the types of arguments', function() {
    var params = foam.types.getFunctionArgs(fn);

    expect(params[0].name).toEqual('paramA');
    expect(params[0].typeName).toEqual('TypeA');
    expect(params[0].optional).toBe(false);
    expect(params[0].documentation).toEqual('docs for, pA');

    expect(params[1].name).toEqual('paramB');
    expect(params[1].typeName).toEqual('TypeB');
    expect(params[1].optional).toBe(true);

    expect(params[2].name).toEqual('paramC');
    expect(params[2].typeName).toEqual('package.TypeC');
    expect(params[2].optional).toBe(false);

    expect(params[3].name).toEqual('noType');
    expect(params[3].typeName).toBeUndefined();
    expect(params[3].optional).toBe(false);

    expect(params.returnType.typeName).toEqual('RetType');

  });
  it('accepts a return with no args', function() {
    var params = foam.types.getFunctionArgs(function(/*RetType*/){});

    expect(params.returnType.typeName).toEqual('RetType');
  });

  it('reports parse failures', function() {
    fn = function(/*RetType*/){};
    fn.toString = function() { return "some garbage string!"; };

    expect(function() { foam.types.getFunctionArgs(fn); }).toThrow();
  });
  it('reports arg parse failures', function() {
    fn = function(/* */ arg){};
    expect(function() { foam.types.getFunctionArgs(fn); }).toThrow();
  });
  it('reports return parse failures', function() {
    fn = function(/* */){};
    expect(function() { foam.types.getFunctionArgs(fn); }).toThrow();
  });
  it('parses no args', function() {
    fn = function(){};

    expect(function() { foam.types.getFunctionArgs(fn); }).not.toThrow();
  });
  it('fails a return before the last arg', function() {
    fn = function(arg1 /* RetType */, arg2){};

    expect(function() { foam.types.getFunctionArgs(fn); }).toThrow();
  });

});

describe('Argument.validate', function() {
  var fn;

  beforeEach(function() {
    fn = makeTestFn();
  });
  afterEach(function() {
    fn = null;
  });

  it('allows optional args to be omitted', function() {
    var params = foam.types.getFunctionArgs(fn);

    expect(function() { params[1].validate(undefined); }).not.toThrow();
    expect(function() { params[2].validate(undefined); }).toThrow();
  });
  it('checks modelled types', function() {
    var params = foam.types.getFunctionArgs(fn);

    expect(function() { params[0].validate(TypeA.create()); }).not.toThrow();
    expect(function() { params[1].validate(TypeB.create()); }).not.toThrow();
    expect(function() { params[1].validate(TypeBB.create()); }).not.toThrow(); //subclass should be ok
    expect(function() { params[2].validate(global['package.TypeC'].create()); }).not.toThrow();

    expect(function() { params[3].validate(TypeA.create()); }).not.toThrow(); // arg 3 not typed
    expect(function() { params[3].validate(99); }).not.toThrow();

    expect(function() { params.returnType.validate(RetType.create()); }).not.toThrow();
  });
  it('rejects wrong modelled types', function() {
    var params = foam.types.getFunctionArgs(fn);

    expect(function() { params[0].validate(TypeB.create()); }).toThrow();
    expect(function() { params[1].validate(TypeA.create()); }).toThrow();
    expect(function() { params[2].validate(RetType.create()); }).toThrow();

    expect(function() { params.returnType.validate(global['package.TypeC'].create()); }).toThrow();
  });
  it('checks primitive types', function() {
    var params = foam.types.getFunctionArgs(makePrimitiveTestFn());

    // /* string */ str, /*boolean*/ bool , /* function*/ func, /*object*/obj, /* number */num
    expect(function() { params[0].validate('hello'); }).not.toThrow();
    expect(function() { params[1].validate(true); }).not.toThrow();
    expect(function() { params[2].validate(function() {}); }).not.toThrow();
    expect(function() { params[3].validate({}); }).not.toThrow();
    expect(function() { params[4].validate(86); }).not.toThrow();
    expect(function() { params[5].validate(['hello']); }).not.toThrow();
  });
  it('rejects wrong primitive types', function() {
    var params = foam.types.getFunctionArgs(makePrimitiveTestFn());

    // /* string */ str, /*boolean*/ bool , /* function*/ func, /*object*/obj, /* number */num
    expect(function() { params[0].validate(78); }).toThrow();
    expect(function() { params[1].validate('nice'); }).toThrow();
    expect(function() { params[2].validate({}); }).toThrow();
    expect(function() { params[3].validate(function() {}); }).toThrow();
    expect(function() { params[4].validate(false); }).toThrow();
    expect(function() { params[5].validate({}); }).toThrow();
  });

  it('parses empty args list with tricky function body', function() {
    var params = foam.types.getFunctionArgs(function() { (3+4); return (1); });

    // /* string */ str, /*boolean*/ bool , /* function*/ func, /*object*/obj, /* number */num
    expect(function() { params[0].validate(78); }).toThrow();
    expect(function() { params[1].validate('nice'); }).toThrow();
    expect(function() { params[2].validate({}); }).toThrow();
    expect(function() { params[3].validate(function() {}); }).toThrow();
    expect(function() { params[4].validate(false); }).toThrow();
    expect(function() { params[5].validate({}); }).toThrow();
  });

});


describe('foam.types.typeCheck', function() {
  var fn;
  var orig;

  beforeEach(function() {
    orig = makeTestFn();
    fn = foam.types.typeCheck(orig);
  });
  afterEach(function() {
    fn = null;
  });

  it('allows valid args', function() {
    expect(function() { fn(TypeA.create(), TypeB.create(), global['package.TypeC'].create(), 99); }).not.toThrow();
  });
  it('allows extra args', function() {
    expect(function() {
        fn(TypeA.create(), TypeB.create(), global['package.TypeC'].create(), 99,
          "extra", 8, 'arg');
    }).not.toThrow();
  });
  it('fails missing args', function() {
    expect(function() { fn(TypeA.create(), TypeB.create()); }).toThrow();
  });
  it('fails bad primitive args', function() {
    expect(function() {
      fn(TypeA.create(), 3, global['package.TypeC'].create(), 99);
    }).toThrow();
  });
  it('fails bad model args', function() {
    expect(function() {
      fn(TypeA.create(), TypeB.create(), TypeA.create(), 99);
    }).toThrow();
  });

  it('fails bad return type', function() {
   var rfn = foam.types.typeCheck(function(arg /* object */) { return arg; });
   expect(function() { rfn({}); }).not.toThrow();
   expect(function() { rfn(99); }).toThrow();
  });
  it('covers no return type', function() {
   var rfn = foam.types.typeCheck(function() { return 1; });
   expect(function() { rfn({}); }).not.toThrow();
  });
  it('does not affect the toString() of the function', function() {
    expect(orig.toString()).toEqual(fn.toString());
  });

});
