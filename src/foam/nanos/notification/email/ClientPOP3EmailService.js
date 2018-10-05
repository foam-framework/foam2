/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'ClientPOP3EmailService',

  implements: [
    'foam.nanos.notification.email.POP3Email'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'foam.nanos.notification.email.POP3Email',
      name: 'delegate'
    }
  ]
});