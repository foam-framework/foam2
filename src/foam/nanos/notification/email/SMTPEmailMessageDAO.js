/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'SMTPEmailMessageDAO',
  extends: 'foam.dao.ProxyDAO',

  methods: [
    {
      name: 'put_',
      javaCode: `
        EmailService service = (EmailService) x.get("smtpEmailService");
        if ( service != null ) {
          try {
            service.sendEmail((EmailMessage) obj);
          } catch (RuntimeException e) {
            e.printStackTrace();
          }
        } else {
           System.out.println("SMTPEmailService not found");
        }
        return super.put_(x, obj);
`
    }
  ]
});
