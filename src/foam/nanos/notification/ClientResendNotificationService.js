/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'ClientResendNotificationService',

  implements: [
    'foam.nanos.notification.ResendNotificationServiceInterface'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'foam.nanos.notification.ResendNotificationServiceInterface',
      name: 'delegate'
    }
  ]
});