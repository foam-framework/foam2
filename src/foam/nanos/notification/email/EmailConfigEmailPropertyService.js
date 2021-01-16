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
    'foam.dao.DAO',
    'foam.nanos.notification.email.EmailConfig',
    'foam.nanos.logger.Logger'
  ],

  methods: [
    {
      name: 'apply',
      type: 'foam.nanos.notification.email.EmailMessage',
      javaCode: `
        Logger logger = (Logger) x.get("logger");
        EmailConfig emailConfig = (EmailConfig) ((DAO) x.get("emailConfigDAO")).find(emailMessage.getSpid());

        // Service property check
        if ( emailConfig == null ) {
          logger.error( "EmailConfigDAO missing spid for email message.");
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
