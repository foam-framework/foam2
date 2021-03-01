/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailTemplateApplyEmailPropertyService',

  documentation: 'Fills unset properties on an email with values from the emailTemplate.',

  implements: [
    'foam.nanos.notification.email.EmailPropertyService'
  ],

  javaImports: [
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.StdoutLogger',
    'foam.util.SafetyUtil'
  ],

  methods: [
    {
      name: 'apply',
      type: 'foam.nanos.notification.email.EmailMessage',
      documentation: 'application of template args to emailTemplate and then onto the emailMessage',
      javaCode: `
      Logger logger = (Logger) x.get("logger");
      if ( logger == null ) {
        logger = new StdoutLogger();
      }
      if ( templateArgs == null ) {
        return emailMessage;
      }
      String templateName = (String)templateArgs.get("template");
      if ( SafetyUtil.isEmpty(templateName) ) return emailMessage;

      String locale = (String) templateArgs.get("locale");

      // STEP 1) Find EmailTemplate
      EmailTemplate emailTemplateObj = DAOResourceLoader.findTemplate(x, templateName, group, locale);
      if ( emailTemplateObj == null ) {
        logger.error(this.getClass().getSimpleName(), "EmailTemplate not found", templateName, group);
        return emailMessage;
      }

      // STEP 2) Apply Template to emailMessage
      try {
        emailMessage = emailTemplateObj.apply(x, group, emailMessage, templateArgs);
      } catch (Exception e) {
        logger.error(new NoSuchFieldException("@EmailTemplateApplyEmailPropertyService: emailTemplate.apply has failed. emailTemplate = {id:" + templateName + ", group:" + group + "}" + e.getMessage()), e);
      }
      return emailMessage;
      `
    }
  ]
});
