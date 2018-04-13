/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth.email',
  name: 'EmailDocInterface',

  methods: [
    {
      name: 'emailDoc',
      returns: 'Promise',
      javaReturns: 'boolean',
      swiftReturns: 'Bool',
      swiftThrows: true,
      args: [
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User',
          swiftType: 'User'
        },
        {
          name: 'docName',
          javaType: 'String',
          swiftType: 'String'
        }
      ],
    },
  ]
});
