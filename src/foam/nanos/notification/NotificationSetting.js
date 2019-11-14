foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'NotificationSetting',

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

  properties: [
    {
      class: 'Long',
      name: 'id'
    }
  ],

  methods: [
    {
      name: 'sendNotification',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'user', type: 'foam.nanos.auth.User' },
        { name: 'notification', type: 'foam.nanos.notification.Notification' }
      ],
      javaCode: `
        DAO notificationDAO  = (DAO) x.get("localNotificationDAO");
        notification = (Notification) notification.fclone();
        notification.setId(0L);
        notification.setUserId(user.getId());
        notification.setBroadcasted(false);
        notification.setGroupId(null);
        try {
          notificationDAO.put_(x, notification);
        } catch (Throwable t) {
          Logger logger = (Logger) x.get("logger");
          logger.error("Failed to send notification: " + t);
        };
      `
    }
  ]
});
