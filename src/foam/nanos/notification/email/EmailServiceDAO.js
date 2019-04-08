/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailServiceDAO',
  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      name: 'emailService',
      documentation: `This property determines how to process the email.`,
      of: 'foam.nanos.notification.email.EmailService',
      class: 'FObjectProperty'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode:
      `
        getEmailService().sendEmail(x, (foam.nanos.notification.email.EmailMessage)obj);
        return getDelegate().inX(x).put(obj);
      `
    }
  ]
});

