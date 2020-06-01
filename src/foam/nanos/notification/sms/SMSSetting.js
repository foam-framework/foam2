
/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.sms',
  name: 'SMSSetting',
  extends: 'foam.nanos.notification.NotificationSetting',

  javaImports: [
    'foam.core.PropertyInfo',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'foam.nanos.notification.sms.SMSMessage',
    'foam.nanos.notification.sms.SMSStatus',
    'java.util.HashSet',
    'java.util.Iterator',
    'java.util.Map',
    'static foam.mlang.MLang.EQ'
  ],

  methods: [
    {
      name: 'resolveNotificationArguments',
      type: 'Map',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'arguments', type: 'Map' },
        { name: 'user', type: 'User' }
      ],
      javaCode: `
        Logger logger = (Logger) x.get("logger");

        Iterator entries = arguments.entrySet().iterator();
        while( entries.hasNext() ) {
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
        DAO smsMessageDAO = (DAO) x.get("localSmsMessageDAO");
        notification = (Notification) notification.fclone();

        SMSMessage smsMessage = new SMSMessage.Builder(x)
            .setUser(user.getId())
            .setMessage(notification.getBody())
            .setPhoneNumber(user.getMobile().getNumber())
            .setStatus(SMSStatus.UNSENT)
            .build();

        // Check if the user has disabled sms notifications
        if ( ! getEnabled() || user == null ) {
          return;
        }

        // Do not send sms notifications to users that are not yet active
        if ( user.getLifecycleState() != LifecycleState.ACTIVE ) {
          return;
        }

        // Skip sending sms messages for disabled topics
        if ( user.getDisabledTopicSet() != null ) {
          HashSet<String> disabledTopics = (HashSet<String>) user.getDisabledTopicSet();
          if ( disabledTopics.contains(notification.getNotificationType()) ) {
            return;
          }
        }

        try {
          smsMessageDAO.put(smsMessage);
        } catch (Throwable t) {
          Logger logger = (Logger) x.get("logger");
          logger.error("Error creating sms message: " + smsMessage + ". Error: " + t);
        }   
      `
    }
  ]
});
