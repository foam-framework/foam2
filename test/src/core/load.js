// Load FOAM into our nodejs instance.
// TODO: Move this to node loading stage
if ( typeof process == 'object' ) {
  require('es6-shim'); // TODO: if we don't need the entire shim, implement some set of polyfills
  require("../../../src/core/node.js");
}

