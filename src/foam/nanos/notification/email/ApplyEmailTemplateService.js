/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'ApplyEmailTemplateService',

  documentation: 'Used in conjuction with ChainedPropertyService',

  implements: [
    'foam.nanos.notification.email.EmailPropertyService'
  ],

  javaImports: [
    'foam.nanos.notification.email.DAOResourceLoader',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil'
  ],

  methods: [
    {
      name: 'apply',
      type: 'foam.nanos.notification.email.EmailMessage',
      documentation: 'application of template args to emailTemplate and then onto the emailMessage',
      javaCode: `
      Logger logger = (Logger) x.get("logger");
      String templateName = (String)templateArgs.get("template");
      if ( SafetyUtil.isEmpty(templateName) ) return emailMessage;

      // STEP 1) Find EmailTemplate
      EmailTemplate emailTemplateObj = DAOResourceLoader.findTemplate(x, templateName, group);
      if ( emailTemplateObj == null ) {
        logger.warning("@ApplyEmailTemplateService: emailTemplate not found.");
        return emailMessage;
      } 

      // STEP 2) Apply Template to emailMessage
      try {
        emailMessage = emailTemplateObj.apply(x, group, emailMessage, templateArgs);
      } catch (Exception e) {
        logger.warning("@ApplyEmailTemplateService: emailTemplate.apply has failed, with a thrown exception. ", e);
        return null;
      }

      return emailMessage;
      `
    }
  ]
});
