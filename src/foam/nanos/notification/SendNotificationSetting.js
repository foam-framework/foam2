foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'SendNotificationSetting',
  implements: [ 'foam.nanos.notification.NotificationSetting'],

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
      args: [
        { name: 'x', type: 'Context' },
        { name: 'notification', type: 'foam.nanos.notification.Notification' },
      ],
      javaCode: `
      DAO userDAO  = (DAO) x.get("localUserDAO");
      DAO businessDAO = (DAO) x.get("localBusinessDAO");
      Business business = (Business) businessDAO.find(notification.getUserId());

      List<UserUserJunction> junctions = ((ArraySink) business.getAgents(x).getJunctionDAO()
        .where(
          EQ(UserUserJunction.TARGET_ID, business.getId())
        )
        .select(new ArraySink())).getArray();

      for ( UserUserJunction junction : junctions ) {
        User user = (User) userDAO.find(junction.getSourceId());
        sendNotificationToUser(x, user, notification);
      }
      `
    },
    {
      name: 'sendNotificationToUser',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'user', type: 'User' },
        { name: 'notification', type: 'foam.nanos.notification.Notification' },
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
