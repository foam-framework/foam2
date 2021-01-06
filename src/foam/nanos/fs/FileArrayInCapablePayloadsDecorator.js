/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'FileArrayInCapablePayloadsDecorator',
  extends: 'foam.nanos.fs.FileArrayDAODecorator',

  imports: [
    'fileDAO'
  ],

  requires: [
    'foam.nanos.fs.File'
  ],

  methods: [
    function write(X, dao, obj, existing) {
      var self = this;
      let payloadsWithData = obj.instance_.capablePayloads &&
          obj.instance_.capablePayloads.filter(f => f.data);
      if ( payloadsWithData &&
           payloadsWithData.length > 0 ) {
        let promises = Promise.all(payloadsWithData.map(async f => {
          return self.SUPER(X, dao, f.data, existing);
        }));
        return promises.then((values) => {
          return obj;
        });
      }
      return Promise.resolve(obj);
    }
  ]
});
