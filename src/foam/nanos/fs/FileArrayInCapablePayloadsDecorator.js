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

  properties: [
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'arrayOfFiles'
    }
  ],

  methods: [
    function write(X, dao, obj, existing) {
      var self = this;
      let payloadsWithData;
      if ( obj.instance_.capablePayloads ) {
        payloadsWithData = obj.instance_.capablePayloads
          .filter(f => f.data && f.data.documents);
            let promises = Promise.all(payloadsWithData.map(async f => {
              return self.SUPER(X, dao, f.data, existing);
          }));
          return Promise.all(promises).then((values) => {
            return obj;
          })
      } else {
        return Promise.resolve(obj);
      }
    }
  ]
})
