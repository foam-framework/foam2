/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'SMTPEmailService',

  documentation: 'Implementation of Email Service using SMTP',

  implements: [
    'foam.nanos.NanoService'
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

            protected Session session_ = null;
            `
        }));
      }
    }
  ],

  properties: [
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
    },
    {
      class: 'String',
      name: 'displayName',
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
`try {
  MimeMessage message = new MimeMessage(session_);

  // don't send email if no sender
  String from = emailMessage.getFrom();
  if ( SafetyUtil.isEmpty(from) )
    return null;

  // add display name if present
  String displayName = emailMessage.getDisplayName();
  if ( SafetyUtil.isEmpty(displayName) ) {
    message.setFrom(new InternetAddress(from));
  } else {
    message.setFrom(new InternetAddress(from, displayName));
  }

  // attach reply to if present
  String replyTo = emailMessage.getReplyTo();
  if ( ! SafetyUtil.isEmpty(replyTo) ) {
    message.setReplyTo(InternetAddress.parse(replyTo));
  }

  // don't send email if no subject
  String subject = emailMessage.getSubject();
  if ( SafetyUtil.isEmpty(subject) )
    return null;
  message.setSubject(subject);

  // don't send email if no body
  String body = emailMessage.getBody();
  if ( SafetyUtil.isEmpty(body) )
    return null;
  message.setContent(body, "text/html; charset=utf-8");

  // don't send email if no recipient
  String[] to = emailMessage.getTo();
  if ( to == null || to.length <= 0 )
    return null;

  if ( to.length == 1 ) {
    message.setRecipient(Message.RecipientType.TO, new InternetAddress(to[0], false));
  } else {
    message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(StringUtils.join(to, ",")));
  }

  // send email even if no CC
  String[] cc = emailMessage.getCc();
  if ( cc != null && cc.length == 1 ) {
    message.setRecipient(Message.RecipientType.CC, new InternetAddress(cc[0], false));
  } else if ( cc != null && cc.length > 1 ) {
    message.setRecipients(Message.RecipientType.CC, InternetAddress.parse(StringUtils.join(cc, ",")));
  }

  // send email even if no BCC
  String[] bcc = emailMessage.getBcc();
  if ( bcc != null && bcc.length == 1 ) {
    message.setRecipient(Message.RecipientType.BCC, new InternetAddress(bcc[0], false));
  } else if ( bcc != null && bcc.length > 1 ) {
    message.setRecipients(Message.RecipientType.BCC, InternetAddress.parse(StringUtils.join(bcc, ",")));
  }

  // set date
  message.setSentDate(new Date());
  return message;
} catch (Throwable t) {
  t.printStackTrace();
  return null;
}`
    },
    {
      name: 'sendEmail',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'emailMessage',
          type: 'foam.nanos.notification.email.EmailMessage'
        }
      ],
      javaCode: `
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
});`
    },
    {
      name: 'start',
      javaCode:
`Properties props = new Properties();
props.setProperty("mail.smtp.auth", getAuthenticate() ? "true" : "false");
props.setProperty("mail.smtp.starttls.enable", getStarttls() ? "true" : "false");
props.setProperty("mail.smtp.host", getHost());
props.setProperty("mail.smtp.port", getPort());
if ( getAuthenticate() ) {
  session_ = Session.getInstance(props, new SMTPAuthenticator(getUsername(), getPassword()));
} else {
  session_ = Session.getInstance(props);
}`
    }
  ]
});
