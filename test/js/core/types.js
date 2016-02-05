
var corePromise = global.loadCoreTo('core/types.js');
var beforeEachTest = function(callback) {
  return beforeEach(function(done) {
    corePromise.then(function() {
      callback();
      done();
    });
  });
};


describe('foam.types.getFunctionArgs', function() {
  var fn;

  beforeEachTest(function() {
    fn = function(/* TypeA */ paramA, /*TypeB?*/ paramB, /* package.TypeC*/ paramC, noType /* RetType */) {
      return true;
    }
  });
  afterEach(function() {
    fn = null;
  });

  it('returns the types of arguments', function() {
    var params = foam.types.getFunctionArgs(fn);
    
    expect(params[0].name).toEqual('paramA');
    expect(params[0].typeName).toEqual('TypeA');

    expect(params[1].name).toEqual('paramB');
    expect(params[1].typeName).toEqual('TypeB?');

    expect(params[2].name).toEqual('paramC');
    expect(params[2].typeName).toEqual('package.TypeC');

    expect(params[3].name).toEqual('noType');
    expect(params[3].typeName).toBeUndefined();
    
    expect(params.returnType).toEqual('RetType');
    
  });


  // it('returns the type of the function return', function() {
  //   var params = foam.types.getFunctionArgs(fn);
  //
  //
  // });

});
