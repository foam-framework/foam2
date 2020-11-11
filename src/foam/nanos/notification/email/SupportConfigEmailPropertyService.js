/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'SupportConfigEmailPropertyService',

  documentation: 'Fills support properties on an email with values from the Theme',

  implements: [
    'foam.nanos.notification.email.EmailPropertyService'
  ],

  javaImports: [
    'foam.nanos.notification.email.SupportConfig',
    'foam.nanos.app.EmailConfig'
  ],

  methods: [
    {
      name: 'apply',
      type: 'foam.nanos.notification.email.EmailMessage',
      javaCode: `
        if ( theme == null ) return emailMessage;
        SupportConfig supportConfig = theme.getSupportConfig();
        EmailConfig emailConfig = supportConfig.getEmailConfig();
        // REPLY TO:
        emailMessage.setReplyTo(emailConfig.getReplyTo());

        // DISPLAY NAME:
        emailMessage.setDisplayName(emailConfig.getDisplayName());

        // FROM:
        emailMessage.setFrom(emailConfig.getFrom());

        return emailMessage;
      `
    }
  ]
});
