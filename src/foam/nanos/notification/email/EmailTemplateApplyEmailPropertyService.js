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
      if ( templateArgs == null ) {
        return emailMessage;
      }
      String templateName = (String)templateArgs.get("template");
      if ( SafetyUtil.isEmpty(templateName) ) return emailMessage;

      // STEP 1) Find EmailTemplate
      EmailTemplate emailTemplateObj = DAOResourceLoader.findTemplate(x, templateName, group);

      // STEP 2) Apply Template to emailMessage
      try {
        emailMessage = emailTemplateObj.apply(x, group, emailMessage, templateArgs);
      } catch (Exception e) {
        if ( logger != null ) {
          logger.error(new NoSuchFieldException("@EmailTemplateApplyEmailPropertyService: emailTemplate.apply has failed. emailTemplate = {id:" + templateName + ", group:" + group + "}" + e));
        }
      }
      return emailMessage;
      `
    }
  ]
});
