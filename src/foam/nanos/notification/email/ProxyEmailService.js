/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'ProxyEmailService',

  documentation: 'This class is used for the purpose of decorating the email(serivce)',

  implements: [
    'foam.nanos.notification.email.EmailService',
    'foam.nanos.NanoService'
  ],

  properties: [
    {
      class: 'Proxy',
      of: 'foam.nanos.notification.email.EmailService',
      name: 'delegate'
    }
  ],

  methods: [
    {
      name: 'sendEmail',
      javaCode:
      `
        getDelegate().sendEmail(x, emailMessage);
      `
    },
    {
      name: 'start',
      javaCode:
      `
        try {
          getDelegate().start();
        } catch (Exception e) {
          e.printStackTrace();
        }
      `
    }
  ]
});
