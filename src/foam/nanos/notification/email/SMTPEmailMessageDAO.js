/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'SMTPEmailMessageDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    The decorator on localEmailMessageDAO that actually sends the email.
  `,

  javaImports: [
    'foam.nanos.logger.Logger',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      name: 'logger',
      javaFactory: `return (Logger) getX().get("logger");`
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        EmailService service = (EmailService) x.get("smtpEmailService");

        if ( service == null ) {
          getLogger().error("SMTPEmailService not found.");
          return super.put_(x, obj);
        }

        EmailMessage message = (EmailMessage) obj;

        if ( message == null ) {
          throw new RuntimeException("Cannot put null.");
        }

        try {
          if ( SafetyUtil.isEmpty(message.getTemplate()) ) {
            service.sendEmail(x, message);
          } else {
            service.sendEmailFromTemplate(x, ((User) x.get("user")), message, message.getTemplate(), message.getTemplateArgs());
          }
        } catch (RuntimeException e) {
          e.printStackTrace();
        }

        return super.put_(x, obj);
`
    }
  ]
});
