/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'LastModifiedAware',

  methods: [
    {
      name: 'getLastModified',
      returns: 'Date',
      javaReturns: 'java.util.Date',
      swiftReturns: 'Date'
    },
    {
      name: 'setLastModified',
      args: [
        {
          name: 'value',
          javaType: 'java.util.Date',
          swiftType: 'Date'
        }
      ]
    }
  ]
});
