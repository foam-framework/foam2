
/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'EmailSetting',
  extends: 'foam.nanos.notification.NotificationSetting',

  javaImports: [
    'foam.core.PropertyInfo',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Emails.EmailsUtility',
    'java.util.Arrays',
    'java.util.Iterator',
    'java.util.List',
    'java.util.Map',
    'java.util.HashMap',
    'static foam.mlang.MLang.EQ'
  ],

  methods: [
    {
      name: 'resolveNotificationArguments',
      type: 'Map',
      documentation: `
          Iterate through arguments to replace propertyInfo values with the notified user' values.
          TODO: Handle nested FObjects passed in as propertyInfo.
      `,
      args: [
        { name: 'x', type: 'Context' },
        { name: 'arguments', type: 'Map' },
        { name: 'user', type: 'User' }
      ],
      javaCode: `
        Logger logger = (Logger) x.get("logger");

        Map<String, Object> args = new HashMap<String, Object>(arguments);
        Iterator entries = args.entrySet().iterator();
        while (entries.hasNext()) {
          Map.Entry entry = (Map.Entry) entries.next();
          if ( entry.getValue() instanceof PropertyInfo ) {
            if ( ! ((PropertyInfo) entry.getValue()).getClassInfo().getObjClass().isAssignableFrom(user.getClass()) ) {
              entry.setValue("");
              logger.error("Cannot set an unrelated PropertyInfo to notified user as an argument value");
              continue;
            }
            entry.setValue(((PropertyInfo) entry.getValue()).get(user));
          }
        }
        return args;
      `
    },
    {
      name: 'sendNotification',
      javaCode: `
        if ( user.getDisabledTopicsEmail() != null ) {
          List disabledTopics = Arrays.asList(user.getDisabledTopicsEmail());
          if ( ! disabledTopics.contains(notification.getNotificationType()) ) {
            EmailMessage message = new EmailMessage();
            message.setTo(new String[]{user.getEmail()});
            Notification clone = (Notification) notification.fclone();

            if ( clone.getEmailArgs() != null ) {
              Map<String, Object> emailArgs = resolveNotificationArguments(x, clone.getEmailArgs(), user);
              clone.setEmailArgs(emailArgs);
            }

            try {
              if ( foam.util.SafetyUtil.isEmpty(clone.getEmailName()) ) {
                message.setSubject(clone.getTemplate());
                message.setBody(clone.getBody());
                EmailsUtility.sendEmailFromTemplate(x, null, message, null, null);
              } else {
                EmailsUtility.sendEmailFromTemplate(x, user, message, clone.getEmailName(), clone.getEmailArgs());
              }
            } catch(Throwable t) {
              Logger logger = (Logger) x.get("logger");
              logger.error("Error sending notification email message: " + message + ". Error: " + t);
            }
          }
        }
      `
    }
  ]
});
