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
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Group',
    'foam.nanos.pool.FixedThreadPool',
    'org.apache.commons.lang3.StringUtils',
    'org.jtwig.JtwigModel',
    'org.jtwig.JtwigTemplate',
    'org.jtwig.environment.EnvironmentConfiguration',
    'org.jtwig.environment.EnvironmentConfigurationBuilder',
    'org.jtwig.resource.loader.TypedResourceLoader',
    'javax.mail.Message',
    'javax.mail.MessagingException',
    'javax.mail.Session',
    'javax.mail.Transport',
    'javax.mail.internet.InternetAddress',
    'javax.mail.internet.MimeMessage',
    'java.util.Date',
    'java.util.Properties'
  ],

  properties: [
    {
      class: 'Object',
      name: 'session',
      javaType: 'javax.mail.Session',
      hidden: true
    },
    {
      class: 'Object',
      name: 'config',
      javaType: 'org.jtwig.environment.EnvironmentConfiguration',
      hidden: true
    },
    {
      class: 'String',
      name: 'host'
    },
    {
      class: 'String',
      name: 'port'
    },
    {
      class: 'String',
      name: 'username'
    },
    {
      class: 'String',
      name: 'password'
    }
  ],

  methods: [
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
  MimeMessage message = new MimeMessage(getSession());

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
      Transport transport = getSession().getTransport("smtp");
      transport.connect(getHost(), getUsername(), getPassword());
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
`DAO emailTemplateDAO = (DAO) getX().get("emailTemplateDAO");
User user = (User) getX().get("user");
EmailTemplate emailTemplate = DAOResourceLoader.findTemplate(emailTemplateDAO, name, (String) user.getGroup());
if ( emailMessage == null )
  return;

EnvironmentConfiguration config = getConfig();
if ( config == null ) {
  config = EnvironmentConfigurationBuilder
      .configuration()
      .resources()
      .resourceLoaders()
      .add(new TypedResourceLoader("dao", new DAOResourceLoader(emailTemplateDAO, (String) user.getGroup())))
      .and().and()
      .build();
  setConfig(config);
}

JtwigTemplate template = JtwigTemplate.inlineTemplate(emailTemplate.getBody(), config);
JtwigModel model = JtwigModel.newModel(templateArgs);
emailMessage.setBody(template.render(model));
sendEmail(emailMessage);`
    },
    {
      name: 'start',
      javaReturns: 'void',
      javaCode:
`Properties props = new Properties();
props.put("mail.smtp.auth", "true");
props.put("mail.smtp.starttls.enable", "true");
props.put("mail.smtp.host", getHost());
props.put("mail.smtp.port", getPort());

setSession(Session.getInstance(props, null));`
    }
  ]
});
