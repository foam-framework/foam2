/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.GENMODEL({
  package: 'foam.nanos.client',
  name: 'Client',
  implements: [ 'foam.box.Context' ],
  requires: [
    // TODO This is just for the build part. Without it, there's no way of
    // knowing that this class uses ClientBuilder so it won't get built by build
    // tool without explicitly listing it. Think of a better place for this.
    'foam.nanos.client.ClientBuilder',

    'foam.box.HTTPBox',
    'foam.dao.RequestResponseClientDAO',
    'foam.dao.ClientDAO',
    'foam.dao.EasyDAO'
  ],
  build: function(X) {
    return X.classloader.load('foam.nanos.client.ClientBuilder').then(function(cls) {
      return new Promise(function(resolve, reject) {
        var b = cls.create(null, X);
        b.then(resolve);
      });
    });
  }
});
