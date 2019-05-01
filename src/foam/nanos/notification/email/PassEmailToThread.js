/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'PassEmailToThread',
  extends: 'foam.nanos.notification.email.ProxyEmailService',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.pool.FixedThreadPool',
    'foam.util.SafetyUtil',
    'java.nio.charset.StandardCharsets',
    'java.util.Date',
    'java.util.Properties',
    'javax.mail.*',
    'javax.mail.internet.InternetAddress',
    'javax.mail.internet.MimeMessage',
    'org.apache.commons.lang3.StringUtils',
    'org.jtwig.JtwigTemplate',
    'org.jtwig.resource.loader.TypedResourceLoader',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Group'
  ],

  methods: [
    {
      name: 'sendEmail',
      javaCode:
      `
        ( (FixedThreadPool) x.get("threadPool") ).submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            try {
              getDelegate().sendEmail(x, emailMessage);
            } catch (Throwable t) {
              t.printStackTrace();
              System.out.println("ANNA PASSEmailToThread");
            }
          }
        });
      `
    }
  ]
});
