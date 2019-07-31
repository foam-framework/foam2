/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'SMTPEmailService',

  implements: [
    'foam.nanos.notification.email.EmailService'
  ],

  documentation: 'Implementation of Email Service using SMTP',

  imports: [
    'threadPool?'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.util.SafetyUtil',
    'java.nio.charset.StandardCharsets',
    'java.util.Date',
    'java.util.Properties',
    'java.util.List',
    'javax.mail.*',
    'javax.mail.internet.InternetAddress',
    'javax.mail.internet.MimeMessage',
    'org.apache.commons.lang3.StringUtils',
    'org.jtwig.JtwigTemplate',
    'org.jtwig.resource.loader.TypedResourceLoader',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Group',
    'foam.nanos.logger.Logger',
    'foam.nanos.om.OMLogger',
    'static foam.mlang.MLang.EQ'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data:
            `private class SMTPAuthenticator extends javax.mail.Authenticator {
              protected String username_;
              protected String password_;

              public SMTPAuthenticator(String username, String password) {
                this.username_ = username;
                this.password_ = password;
              }

              @Override
              protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(this.username_, this.password_);
              }
            }
            `
        }));
      }
    }
  ],

  properties: [
    {
      name: 'session_',
      javaType: 'Session',
      class: 'Object',
      javaFactory:
      `
        Properties props = new Properties();
        props.setProperty("mail.smtp.auth", getAuthenticate() ? "true" : "false");
        props.setProperty("mail.smtp.starttls.enable", getStarttls() ? "true" : "false");
        props.setProperty("mail.smtp.host", getHost());
        props.setProperty("mail.smtp.port", getPort());
        if ( getAuthenticate() ) {
          return Session.getInstance(props, new SMTPAuthenticator(getUsername(), getPassword()));
        }
        return Session.getInstance(props);
      `
    },
    {
      class: 'Object',
      javaType: 'Transport',
      name: 'transport_',
      javaFactory:
      `
        Logger logger = (Logger) getX().get("logger");
        Transport transport = null;
        try {
          transport = getSession_().getTransport("smtp");
          transport.connect(getUsername(), getPassword());
          logger.info("SMTPEmailService connected.");
        } catch ( Exception e ) {
          logger.error("Transport failed to initialize: " + e);
        }
        return transport;
      `
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
      name: 'createMimeMessage',
      javaType: 'MimeMessage',
      documentation: `Create a MimeMessage from the passed EmailMessage`,
      args: [
        {
          name: 'emailMessage',
          type: 'foam.nanos.notification.email.EmailMessage'
        }
      ],
      javaCode:
      `
        Logger logger = (Logger) getX().get("logger");
        try {
          MimeMessage message = new MimeMessage(getSession_());

          // the From Property is mainly to hide our smtp user credetials.
          if ( emailMessage.isPropertySet("from") ) {
            if ( emailMessage.isPropertySet("displayName") ) {
              message.setFrom( new InternetAddress(emailMessage.getFrom(), emailMessage.getDisplayName()) );
            } else {
              message.setFrom(new InternetAddress(emailMessage.getFrom()));
            }
          } else if ( emailMessage.isPropertySet("replyTo") ) {
              if ( emailMessage.isPropertySet("displayName") ) {
                message.setFrom( new InternetAddress(emailMessage.getReplyTo(), emailMessage.getDisplayName()) );
              } else {
                message.setFrom(new InternetAddress(emailMessage.getReplyTo()));
              }
          }
          
          if ( emailMessage.isPropertySet("replyTo") )
            message.setReplyTo(InternetAddress.parse(emailMessage.getReplyTo()));

          if ( emailMessage.isPropertySet("subject") )
            message.setSubject(emailMessage.getSubject());

          if ( emailMessage.isPropertySet("body") )
            message.setContent(emailMessage.getBody(), "text/html; charset=utf-8");

          if ( emailMessage.isPropertySet("to") ) {
            if ( emailMessage.getTo().length == 1 ) {
              message.setRecipient(Message.RecipientType.TO, new InternetAddress((emailMessage.getTo())[0], false));
            } else {
              message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(StringUtils.join(emailMessage.getTo(), ",")));
            }
          }

          if ( emailMessage.isPropertySet("cc") ) {
            if ( emailMessage.getCc().length == 1 ) {
              message.setRecipient(Message.RecipientType.CC, new InternetAddress((emailMessage.getCc())[0], false));
            } else {
              message.setRecipients(Message.RecipientType.CC, InternetAddress.parse(StringUtils.join(emailMessage.getCc(), ",")));
            }
          }
          
          if ( emailMessage.isPropertySet("bcc") ) {
            if ( emailMessage.getBcc().length == 1 ) {
              message.setRecipient(Message.RecipientType.BCC, new InternetAddress((emailMessage.getBcc())[0], false));
            } else {
              message.setRecipients(Message.RecipientType.BCC, InternetAddress.parse(StringUtils.join(emailMessage.getBcc(), ",")));
            }
          }
          
          message.setSentDate(new Date());
          logger.info("SMTPEmailService Created MimeMessage.");
          return message;
        } catch (Throwable t) {
          logger.error("SMTPEmailService failed to created MimeMessage. " + t);
          return null;
        }
      `
    },
    {
      name: 'sendEmail',
      javaCode: `
        emailMessage = (EmailMessage) emailMessage.fclone();
        MimeMessage message = createMimeMessage(emailMessage);
        Logger logger = (Logger) getX().get("logger");
        try {
          getTransport_().send(message);
          emailMessage.setStatus(Status.SENT);
          logger.debug("SMTPEmailService sent MimeMessage.");
        } catch ( SendFailedException e ) {
          emailMessage.setStatus(Status.FAILED);
          logger.error("SMTPEmailService sending MimeMessage failed. " + e);
        } catch ( MessagingException e ) {
          try {
            getTransport_().close();
          } catch ( Exception e2 ) {
            logger.error("Failed to close transport. " + e2);
          }
          clearTransport_();
          logger.error("SMTPEmailService sending MimeMessage failed. " + e);
        }
        return emailMessage;
      `
    }
  ]
});
