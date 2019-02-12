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
      async: true,
      type: 'Boolean',
      swiftThrows: true,
      args: [
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        },
        {
          name: 'docName',
          type: 'String'
        }
      ],
    },
  ]
});
