require("../foam.js");

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
