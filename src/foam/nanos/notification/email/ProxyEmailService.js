/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'ProxyEmailService',

  documentation: `A proxy for an EmailService.`,

  implements: [
    'foam.nanos.notification.email.EmailService'
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
      javaCode: `
        getDelegate().sendEmail(x, emailMessage);
      `
    },
    {
      name: 'sendEmailFromTemplate',
      javaCode: `
        getDelegate().sendEmailFromTemplate(x, user, emailMessage, name, templateArgs);
      `
    }
  ]
});
