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
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.pool.FixedThreadPool'
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
            }
          }
        });
      `
    }
  ]
});
