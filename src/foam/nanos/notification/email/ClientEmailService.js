/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'ClientEmailService',

  implements: [
    'foam.nanos.notification.email.EmailService'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'foam.nanos.notification.email.EmailService',
      name: 'delegate'
    }
  ]
});
