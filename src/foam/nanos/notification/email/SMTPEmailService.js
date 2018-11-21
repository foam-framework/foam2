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
    'threadPool?', // Only imported in Java
    'appConfig?'
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
    'org.jtwig.environment.EnvironmentConfiguration',
    'org.jtwig.environment.EnvironmentConfigurationBuilder',
    'org.jtwig.JtwigModel',
    'org.jtwig.JtwigTemplate',
    'org.jtwig.resource.loader.TypedResourceLoader',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Group',
    'foam.nanos.app.AppConfig',
    'foam.dao.ArraySink',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'java.util.List'
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
      name: 'from',
      value: null
    },
    {
      class: 'String',
      name: 'displayName',
      value: null
    },
    {
      class: 'String',
      name: 'replyTo',
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
          type: 'String'
        }
      ],
      javaCode:
`if ( config_ == null ) {
  config_ = EnvironmentConfigurationBuilder
    .configuration()
    .resources()
      .resourceLoaders()
        .add(new TypedResourceLoader("dao", new DAOResourceLoader(getX(), group)))
      .and()
    .and()
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
          javaType: 'foam.core.X'
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
      MimeMessage message = createMimeMessage(finalizeEmailConfig(x, emailMessage));
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
      javaCode: `
if ( ! this.getEnabled() ) return;

String group = user != null ? (String) user.getGroup() : null;
EmailTemplate emailTemplate = DAOResourceLoader.findTemplate(getX(), name, group);
if ( emailMessage == null )
  return;

for ( String key : templateArgs.keySet() ) {
  Object value = templateArgs.get(key);
  if ( value instanceof String ) {
    String s = (String) value;
    templateArgs.put(key, new String(s.getBytes(StandardCharsets.ISO_8859_1), StandardCharsets.UTF_8));
  }
}

EnvironmentConfiguration config = getConfig(group);
JtwigModel model = JtwigModel.newModel(templateArgs);
emailMessage = (EmailMessage) emailMessage.fclone();

JtwigTemplate templateBody =    JtwigTemplate.inlineTemplate(emailTemplate.getBody(), config);
emailMessage.setBody(templateBody.render(model));

// If subject has already provided, then we don't want to use template subject.
if (SafetyUtil.isEmpty(emailMessage.getSubject())) {
  JtwigTemplate templateSubject = JtwigTemplate.inlineTemplate(emailTemplate.getSubject(), config);
  emailMessage.setSubject(templateSubject.render(model));
}

sendEmail(x, emailMessage);`
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
    },
    {
      name: 'finalizeEmailConfig',
      javaReturns: 'foam.nanos.notification.email.EmailMessage',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'emailMessage',
          javaType: 'final foam.nanos.notification.email.EmailMessage'
        }
      ],
      javaCode:
        `
User user      = findUser(x, emailMessage);

DAO groupDAO   = (DAO) x.get("groupDAO");
Group group    = (Group) groupDAO.find(user.getGroup());

if ( SafetyUtil.isEmpty(emailMessage.getFrom()) ) {
  emailMessage.setFrom(
    ! SafetyUtil.isEmpty(group.getFrom()) ?
      group.getFrom() : getFrom()
  );
}

if ( SafetyUtil.isEmpty(emailMessage.getReplyTo()) ) {
  emailMessage.setReplyTo(
    ! SafetyUtil.isEmpty(group.getReplyTo()) ?
      group.getReplyTo() : getReplyTo()
  );
}

if ( SafetyUtil.isEmpty(emailMessage.getDisplayName()) ) {
  emailMessage.setDisplayName(
    ! SafetyUtil.isEmpty(group.getDisplayName()) ? group.getDisplayName() : getDisplayName()
  );
}

return emailMessage;
      `
    },
    {
      name: 'findUser',
      javaReturns: 'foam.nanos.auth.User',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'emailMessage',
          javaType: 'final foam.nanos.notification.email.EmailMessage'
        }
      ],
      javaCode:
        `
foam.nanos.session.Session session = x.get(foam.nanos.session.Session.class);

DAO userDAO         = (DAO) x.get("localUserDAO");
User user           = (User) userDAO.find(session.getUserId());

// 1. If the user doesn't login at this time, get the user from localUserDao
// 2. If the user is the system user, get the real user from localUserDao
if ( user == null || user.getId() == 1 ) {

  Sink sink = new ArraySink();
  sink = userDAO.where(MLang.EQ(User.EMAIL, emailMessage.getTo()[0]))
    .limit(1).select(sink);

  List list = ((ArraySink) sink).getArray();
  if ( list == null || list.size() == 0 ) {
    throw new RuntimeException("User not found");
  }

  user = (User) list.get(0);
  if ( user == null ) {
    throw new RuntimeException("User not found");
  }
}

return user;
      `
    }
  ]
});
