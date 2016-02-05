
var corePromise = global.loadCoreTo('core/types.js');
var beforeEachTest = function(callback) {
  return beforeEach(function(done) {
    corePromise.then(function() {
      callback();
      done();
    });
  });
};

function makeTestFn() {
  CLASS({  name: 'TypeA' });
  CLASS({  name: 'TypeB' });
  CLASS({  name: 'TypeBB', extends: 'TypeB' });
  CLASS({  name: 'package.TypeC' });
  CLASS({  name: 'RetType' });
  return function test(/* TypeA */ paramA, /*TypeB?*/ paramB , /* package.TypeC*/ paramC, noType /* RetType */ ) {
    return true;
  }  
}
function makePrimitiveTestFn() {
return function(/* string */ str, /*boolean*/ bool , 
  /* function*/ func, /*object*/obj, /* number */num ) {
    return true;
  }  
}

describe('foam.types.getFunctionArgs', function() {
  var fn;

  beforeEachTest(function() {
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
});

describe('Argument.validate', function() {
  var fn;

  beforeEachTest(function() {
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
  });
  it('rejects wrong primitive types', function() {
    var params = foam.types.getFunctionArgs(makePrimitiveTestFn());

    // /* string */ str, /*boolean*/ bool , /* function*/ func, /*object*/obj, /* number */num 
    expect(function() { params[0].validate(78); }).toThrow();
    expect(function() { params[1].validate('nice'); }).toThrow();
    expect(function() { params[2].validate({}); }).toThrow();
    expect(function() { params[3].validate(function() {}); }).toThrow();
    expect(function() { params[4].validate(false); }).toThrow();
  });

});





