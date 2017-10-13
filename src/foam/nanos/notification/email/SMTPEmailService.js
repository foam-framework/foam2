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
    'foam.nanos.notification.email.EmailService'
  ],

  javaImports: [
    'javax.mail.*',
    'javax.mail.internet.InternetAddress',
    'javax.mail.internet.MimeMessage',
    'java.util.Arrays',
    'java.util.Date',
    'java.util.Properties',
    'java.util.stream.Collectors',
  ],

  properties: [
    {
      class: 'Object',
      name: 'session',
      javaType: 'javax.mail.Session',
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
      javaThrows: [
        'javax.mail.MessagingException'
      ],
      args: [
        {
          name: 'emailMessage',
          javaType: 'foam.nanos.notification.email.EmailMessage'
        }
      ],
      javaCode:
`MimeMessage message = new MimeMessage(getSession());

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
  message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(
      Arrays.stream(to).collect(Collectors.joining(",")), false));
}

 // send email even if no CC
 String[] cc = emailMessage.getCc();
 if ( cc != null && cc.length == 1 ) {
   message.setRecipient(Message.RecipientType.CC, new InternetAddress(cc[0], false));
} else if ( cc != null && cc.length > 1 ) {
  message.setRecipients(Message.RecipientType.CC, InternetAddress.parse(
      Arrays.stream(cc).collect(Collectors.joining(",")), false));
}

// send email even if no BCC
String[] bcc = emailMessage.getBcc();
if ( bcc != null && bcc.length == 1 ) {
  message.setRecipient(Message.RecipientType.BCC, new InternetAddress(bcc[0], false));
} else if ( bcc != null && bcc.length > 1 ) {
  message.setRecipients(Message.RecipientType.BCC, InternetAddress.parse(
      Arrays.stream(bcc).collect(Collectors.joining(",")), false));
}

// set date
message.setSentDate(new Date());
return message;`
    },
    {
      name: 'sendEmail',
      javaReturns: 'void',
      javaThrows: [
        'javax.mail.MessagingException'
      ],
      javaCode:
`MimeMessage message = createMimeMessage(emailMessage);
if ( message == null )
  return;

// send message
Transport transport = getSession().getTransport("smtp");
transport.connect(getHost(), getUsername(), getPassword());
transport.sendMessage(message, message.getAllRecipients());
transport.close();`
    },
    {
      name: 'sendEmailFromTemplate',
      javaReturns: 'void',
      javaThrows: [
        'javax.mail.MessagingException'
      ],
      javaCode:
`return;`,
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