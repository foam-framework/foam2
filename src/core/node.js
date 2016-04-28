require("./foam.js");
//require("es6-shim"); // Promise, Math.trunc

// TODO: decide on polyfilling ourselves, or continue to use this lib

/** Math.trunc polyfill */
Math.trunc = Math.trunc || function(x) {
  return x < 0 ? Math.ceil(x) : Math.floor(x);
}


/** Promise polyfill */
if ( typeof Promise === 'undefined' ) {
  var p = function Promise(exec) {
    return foam.promise.newPromise(exec);
  };
  p.resolve = foam.promise.resolve;
  p.reject = foam.promise.reject;
  p.all = foam.promise.all;
  global.Promise = p;
}

