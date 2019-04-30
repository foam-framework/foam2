/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'PassEmailToThread',
  extends: 'foam.dao.ProxyDAO',

  implements: [
    'foam.nanos.NanoService',
    // 'foam.nanos.notification.email.EmailService'
  ],

  imports: [
    'threadPool?', // Only imported in Java
  ],

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

  properties: [
    {
      name: 'emailService',
      documentation: `This property determines how to process the email.`,
      of: 'foam.nanos.notification.email.EmailService',
      class: 'FObjectProperty'
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true,
      javaFactory: 'return true;'
    },
    {
      class: 'String',
      name: 'host',
      value: '127.0.0.1'
    },
    {
      class: 'String',
      name: 'port',
      value: '25'
    },
    {
      class: 'Boolean',
      name: 'authenticate',
      value: false
    },
    {
      class: 'Boolean',
      name: 'starttls',
      value: false
    },
    {
      class: 'String',
      name: 'username',
      value: null
    },
    {
      class: 'String',
      name: 'password',
      value: null
    }
  ],

  methods: [
    {
      name: 'put_',
      javaThrows: ['IllegalStateException'],
      javaCode:
        `
        if ( ! this.getEnabled() ) return;
        
        ((FixedThreadPool) getThreadPool()).submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            try {
              MimeMessage message = createMimeMessage(emailMessage);
              if ( message == null ) {
                return;
              }

              // send message
              Transport transport = session_.getTransport("smtp");
              transport.connect();
              transport.sendMessage(message, message.getAllRecipients());
              transport.close();
            } catch (Throwable t) {
              t.printStackTrace();
            }
          }
        });
        `
    },
    {
      name: 'start',
      javaCode:
        `
        Properties props = new Properties();
        props.setProperty("mail.smtp.auth", getAuthenticate() ? "true" : "false");
        props.setProperty("mail.smtp.starttls.enable", getStarttls() ? "true" : "false");
        props.setProperty("mail.smtp.host", getHost());
        props.setProperty("mail.smtp.port", getPort());
        if ( getAuthenticate() ) {
          session_ = Session.getInstance(props, new SMTPAuthenticator(getUsername(), getPassword()));
        } else {
          session_ = Session.getInstance(props);
        }
        `
    }
  ]
});
