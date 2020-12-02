/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailServiceDAO',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.email.EmailService'
  ],

  imports: [
    'EmailService email?'
  ],

  properties: [
    {
      name: 'emailService',
      documentation: `This property determines how to process the email.`,
      of: 'foam.nanos.notification.email.EmailService',
      class: 'FObjectProperty',
      javaFactory: `
      return (EmailService)getEmail();
      `
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode:
      `
        EmailService service = getEmailService();
        if ( service != null ) {
          service.sendEmail(x, (EmailMessage)obj);
        } else {
          ((foam.nanos.logger.Logger) x.get("logger")).debug("EmailServiceDAO emailService null");
        }
        return getDelegate().inX(x).put(obj);
      `
    }
  ]
});

