/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'ApplyEmailTemplateService',

  implements: [
    'foam.nanos.notification.email.EmailPropertyService'
  ],

  methods: [
    {
      name: 'apply',
      type: 'foam.nanos.notification.email.EmailMessage',
      // javaThrows: ['java.lang.NoSuchFieldException'],
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'group',
          class: 'String',
          documentation: 'group of user whose the recipient of the email being sent'
        },
        {
          name: 'emailMessage',
          type: 'foam.nanos.notification.email.EmailMessage',
          documentation: 'Email message'
        },
        {
          name: 'templateArgs',
          type: 'Map',
          documentation: 'Template arguments'
        }
      ],
      javaCode: `
      EnvironmentConfiguration config = null;
      String templateName = templateArgs.get("template");

      // STEP 1) Find EmailTemplate
      EmailTemplate emailTemplateObj = DAOResourceLoader.findTemplate(x, templateName, group);
      if ( emailTemplateObj == null ) {
        logger.warning("@EmailsUtility: emailTemplate not found.");
        return emailMessage;
      } 

      // STEP 2) Apply Template to emailMessage
      try {
        emailMessage = emailTemplateObj.apply(x, group, emailMessage, templateArgs);
      } catch (Exception e) {
        logger.warning("@EmailsUtility: emailTemplate.apply has failed, with a thrown exception. ", e);
        return;
      }

      return emailMessage;
      `
    }
  ]
});
