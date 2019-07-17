/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'ProxyEmailService',

  documentation: 'This class is used for the purpose of decorating the email(service)',

  implements: [
    'foam.nanos.notification.email.EmailService'
  ],

  properties: [
    {
      class: 'Proxy',
      of: 'foam.nanos.notification.email.EmailService',
      name: 'delegate'
    }
  ]

});
