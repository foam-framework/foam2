/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.GENMODEL({
  id: 'foam.nanos.client.Client',
  requires: [
    'foam.nanos.client.ClientBuilder'
  ],
  build: function(X) {
    var builder = foam.nanos.client.ClientBuilder.create(null, X);
    return new Promise(function(resolve, reject) {
      builder.then(resolve);
    });
  }
});
