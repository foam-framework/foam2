/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.notification.push',
  name: 'PushService',

  methods: [
    {
      name: 'sendPush',
      returns: 'Promise',
      javaReturns: 'boolean',
      args: [
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User'
        },
        {
          name: 'msg',
          javaType: 'String'
        },
        {
          name: 'data',
          javaType: 'java.util.Map'
        }
      ]
    }
  ]
});
