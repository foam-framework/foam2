/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailConfigEmailPropertyService',

  documentation: 'Fills unset properties on an email with values from the system emailConfig service.',

  implements: [
    'foam.nanos.notification.email.EmailPropertyService'
  ],

  javaImports: [
    'foam.nanos.app.EmailConfig',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil'
  ],

  methods: [
    {
      name: 'apply',
      type: 'foam.nanos.notification.email.EmailMessage',
      javaCode: `
        Logger logger = (Logger) x.get("logger");
        EmailConfig emailConfig = (EmailConfig) x.get("emailConfig");

        // Service property check
        if ( emailConfig == null ) {
          logger.error( "EmailConfig service has invalid property settings.");
          return emailMessage;
        }

        // REPLY TO:
        if ( ! emailMessage.isPropertySet("replyTo") ) {
          emailMessage.setReplyTo(emailConfig.getReplyTo());
        }

        // DISPLAY NAME:
        if ( ! emailMessage.isPropertySet("displayName") ) {
          emailMessage.setDisplayName(emailConfig.getDisplayName());
        }

        // FROM:
        if ( ! emailMessage.isPropertySet("from") ) {
          emailMessage.setFrom(emailConfig.getFrom());
        }

        return emailMessage;
      `
    }
  ]
});
