/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'TransportEmailMessageDAO',
  extends: 'foam.dao.ProxyDAO',

  methods: [
    {
      name: 'put_',
      javaCode: `
        EmailService service = (EmailService) x.get("transportEmailService");
        if ( service != null ) {
          try {
            service.sendEmail(x, (EmailMessage) obj);
          } catch (RuntimeException e) {
            e.printStackTrace();
          }
        } else {
           System.out.println("transportEmailService not found");
        }
        return super.put_(x, obj);
`
    }
  ]
});
