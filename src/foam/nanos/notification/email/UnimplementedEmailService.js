/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'UnimplementedEmailService',

  implements: [
    'foam.nanos.notification.email.EmailService'
  ],

  documentation: `
    An EmailService that has no implementation.

    Used as the default value in FOAM for the root EmailService in the decorator
    chain. When its methods are called it logs a useful message to the console
    letting the developer know that they need to override the email service with
    their own implementation.
  `,

  imports: [
    'logger?' // Only needed on Java side
  ],

  javaImports: [
    'foam.nanos.logger.Logger'
  ],

  constants: [
    {
      type: 'String',
      name: 'NO_EMAIL_IMPLEMENTATION',
      value: `Email not sent. FOAM does not come with an implementation of the email service. As a developer using FOAM in your application, you must override the service named 'email' with your own implementation for sending emails.`
    }
  ],

  methods: [
    {
      name: 'sendEmail',
      javaCode: `
        ((Logger) getLogger()).warning(NO_EMAIL_IMPLEMENTATION);
      `
    },
    {
      name: 'sendEmailFromTemplate',
      javaCode: `
        ((Logger) getLogger()).warning(NO_EMAIL_IMPLEMENTATION);
      `
    }
  ]
});
