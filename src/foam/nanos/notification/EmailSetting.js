
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
    'foam.nanos.auth.User',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.app.AppConfig',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Emails.EmailsUtility',
    'java.util.HashSet',
    'java.util.Iterator',
    'java.util.Map',
    'foam.util.SafetyUtil',
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

        Iterator entries = arguments.entrySet().iterator();
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
        return arguments;
      `
    },
    {
      name: 'sendNotification',
      javaCode: `
        // Check if the user has disabled email notifications
        if ( ! getEnabled() || user == null )
          return;

        // Do not send notifications to users that are not yet active
        if ( user.getLifecycleState() != LifecycleState.ACTIVE )
          return;

        // Skip sending email messages for disabled topics
        if ( user.getDisabledTopicSet() != null ) {
          HashSet<String> disabledTopics = (HashSet<String>) user.getDisabledTopicSet();
          if ( disabledTopics.contains(notification.getNotificationType()) ) {
            return;
          }
        }

        Logger logger = (Logger) x.get("logger");
        EmailMessage message = new EmailMessage();
        message.setSpid(user.getSpid());
        message.setTo(new String[] { user.getEmail() });
        notification = (Notification) notification.fclone();

        if ( notification.getEmailArgs() != null ) {
          Map<String, Object> emailArgs = resolveNotificationArguments(x, notification.getEmailArgs(), user);
          notification.setEmailArgs(emailArgs);
        }

        if ( "notification".equals(notification.getEmailName()) ) {
          notification.getEmailArgs().put("type", notification.getNotificationType());

          AppConfig config = user.findGroup(x).getAppConfig(x);
          if ( config != null ) {
            notification.getEmailArgs().put("link", config.getUrl());
          }
        }

        if ( ! SafetyUtil.isEmpty(notification.getBody()) ) {
          notification.getEmailArgs().put("body", notification.getBody());
        }

        try {
          if ( ! SafetyUtil.isEmpty(notification.getEmailName()) ) {
            EmailsUtility.sendEmailFromTemplate(x, user, message, notification.getEmailName(), notification.getEmailArgs());
          } else {
            logger.warning("No email template found");
          }
        } catch(Throwable t) {
          logger.error("Error sending notification email message: " + message + ". Error: " + t);
        }
      `
    }
  ]
});
