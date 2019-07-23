/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'AsyncEmailService',
  extends: 'foam.nanos.notification.email.ProxyEmailService',

  javaImports: [
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.logger.Logger'
  ],

  methods: [
    {
      name: 'sendEmail',
      javaCode:
      `
        ( (Agency) x.get("threadPool") ).submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            Logger logger = (Logger) x.get("logger");
            try {
              logger.info("AsyncEmailService RUNNING");
              getDelegate().sendEmail(x, emailMessage);
            } catch(Exception e) {
              logger.error("@AsyncEmailService: " + e);
            }
          }
        }, "Async Email Service");
      `
    }
  ]
});
