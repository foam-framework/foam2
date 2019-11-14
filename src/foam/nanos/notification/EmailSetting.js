foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'EmailSetting',
  extends: 'foam.nanos.notification.NotificationSetting',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserUserJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Emails.EmailsUtility',
    'java.util.Arrays',
    'java.util.List',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.EQ'
  ],

  methods: [
    {
      name: 'sendNotification',
      javaCode: `
        if ( user.getDisabledTopicsEmail() != null ) {
          List disabledTopics = Arrays.asList(user.getDisabledTopicsEmail());
          if ( ! disabledTopics.contains(notification.getNotificationType()) ) {
            EmailMessage message = new EmailMessage();
            message.setTo(new String[]{user.getEmail()});

            try {
              if ( foam.util.SafetyUtil.isEmpty(notification.getEmailName()) ) {
                message.setSubject(notification.getTemplate());
                message.setBody(notification.getBody());
                EmailsUtility.sendEmailFromTemplate(x, null, message, null, null);
              } else {
                EmailsUtility.sendEmailFromTemplate(x, user, message, notification.getEmailName(), notification.getEmailArgs());
              }
            } catch(Throwable t) {
              Logger logger = (Logger) x.get("logger");
              logger.error("Error sending notification email message: "+message+". Error: " + t);
            }
          }
        }
      `
    }
  ]
});
  