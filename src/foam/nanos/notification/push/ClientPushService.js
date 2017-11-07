/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.push',
  name: 'ClientPushService',

  implements: [
    'foam.nanos.notification.push.PushService'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'foam.nanos.notification.push.PushService',
      name: 'delegate'
    }
  ]
});