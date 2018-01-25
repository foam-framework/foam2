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
    'foam.nanos.NanoService',
    'foam.nanos.notification.email.EmailService'
  ],

  imports: [
    'threadPool?' // Only imported in Java
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.pool.FixedThreadPool',
    'org.apache.commons.lang3.StringUtils',
    'org.jtwig.JtwigModel',
    'org.jtwig.JtwigTemplate',
    'org.jtwig.environment.EnvironmentConfiguration',
    'org.jtwig.environment.EnvironmentConfigurationBuilder',
    'org.jtwig.resource.loader.TypedResourceLoader',
    'javax.mail.*',
    'javax.mail.internet.InternetAddress',
    'javax.mail.internet.MimeMessage',
    'java.util.Date',
    'java.util.Properties'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
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
protected EnvironmentConfiguration config_ = null;`
        }))
      }
    }
  ],

  properties: [
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
      name: 'getConfig',
      javaReturns: 'EnvironmentConfiguration',
      args: [
        {
          name: 'group',
          javaType: 'String'
        }
      ],
      javaCode:
`if ( config_ == null ) {
  config_ = EnvironmentConfigurationBuilder
    .configuration()
    .resources()
    .resourceLoaders()
    .add(new TypedResourceLoader("dao", new DAOResourceLoader(getX(), group)))
    .and().and()
    .build();
}
return config_;`
    },
    {
      name: 'createMimeMessage',
      javaReturns: 'MimeMessage',
      args: [
        {
          name: 'emailMessage',
          javaType: 'foam.nanos.notification.email.EmailMessage'
        }
      ],
      javaCode:
`try {
  MimeMessage message = new MimeMessage(session_);

  // don't send email if no sender
  String from = emailMessage.getFrom();
  if ( from == null || from.isEmpty() )
    return null;
  message.setFrom(new InternetAddress(from));

  // don't send email if no subject
  String subject = emailMessage.getSubject();
  if ( subject == null || subject.isEmpty() )
    return null;
  message.setSubject(subject);

  // don't send email if no body
  String body = emailMessage.getBody();
  if ( body == null || body.isEmpty() )
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
} catch (MessagingException e) {
  e.printStackTrace();
  return null;
}`
    },
    {
      name: 'sendEmail',
      args: [
        {
          name: 'emailMessage',
          javaType: 'final foam.nanos.notification.email.EmailMessage'
        }
      ],
      javaCode:
`((FixedThreadPool) getThreadPool()).submit(getX(), new ContextAgent() {
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
      name: 'sendEmailFromTemplate',
      javaCode:
`String group = user != null ? (String) user.getGroup() : null;
EmailTemplate emailTemplate = DAOResourceLoader.findTemplate(getX(), name, group);
if ( emailMessage == null )
  return;

EnvironmentConfiguration config = getConfig(group);
JtwigTemplate template = JtwigTemplate.inlineTemplate(emailTemplate.getBody(), config);
JtwigModel model = JtwigModel.newModel(templateArgs);
emailMessage.setSubject(emailTemplate.getSubject());
emailMessage.setBody(template.render(model));
sendEmail(emailMessage);`
    },
    {
      name: 'start',
      javaReturns: 'void',
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
