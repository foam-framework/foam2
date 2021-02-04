
/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'NotificationSetting',

  implements: [
    'foam.nanos.auth.Authorizable',
    'foam.nanos.auth.ServiceProviderAware'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.ServiceProviderAwareSupport',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.Themes',
    'java.util.HashSet'
  ],

  messages: [
    {
      name: 'LACKS_CREATE_PERMISSION',
      message: 'You don\'t have permission to create this notification setting'
    },
    {
      name: 'LACKS_UPDATE_PERMISSION',
      message: 'You don\'t have permission to update notification settings you do not own'
    },
    {
      name: 'LACKS_DELETE_PERMISSION',
      message: 'You don\'t have permission to delete notification settings you do not own'
    },
    {
      name: 'LACKS_READ_PERMISSION',
      message: 'You don\'t have permission to read notification settings you do not own'
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid',
      javaFactory: `
        var spidMap = new java.util.HashMap();
        spidMap.put(
          NotificationSetting.class.getName(),
          new foam.core.PropertyInfo[] { NotificationSetting.OWNER }
        );
        return new ServiceProviderAwareSupport()
          .findSpid(foam.core.XLocator.get(), spidMap, this);
      `
    }
  ],

  methods: [
    {
      name: 'doNotify',
      args: [
        { name: 'x',            type: 'Context' },
        { name: 'user',         type: 'foam.nanos.auth.User' },
        { name: 'notification', type: 'foam.nanos.notification.Notification' }
      ],
      javaCode: `
        X userX = x;
        Subject subject = (Subject) x.get("subject");
        if ( subject.getRealUser().getId() != user.getId() ) {
          userX = x.put("subject", new Subject.Builder(x).setUser(user).build());
          AppConfig appConfig = user.findGroup(x).getAppConfig(x);
          Theme theme = (Theme) x.get("theme");
          if ( theme == null ) {
            theme = ((Themes) x.get("themes")).findTheme(userX);
            if ( theme.getAppConfig() != null ) {
              appConfig.copyFrom(theme.getAppConfig());
            }}
          userX.put("appConfig", appConfig);
        }
        // Proxy to sendNotification method
        sendNotification(userX, user, notification);
      `
    },
    {
      name: 'sendNotification',
      args: [
        { name: 'x',            type: 'Context' },
        { name: 'user',         type: 'foam.nanos.auth.User' },
        { name: 'notification', type: 'foam.nanos.notification.Notification' }
      ],
      javaCode: `
        notification = (Notification) notification.fclone();
        notification.setId(0L);
        notification.setUserId(user.getId());
        notification.setBroadcasted(false);
        notification.setGroupId(null);

        // We cannot permanently disable in-app notifications, so mark them read automatically
        if ( ! getEnabled() ) {
          notification.setRead(true);
        } else if ( user.getDisabledTopicSet() != null ) {
          HashSet<String> disabledTopicsSet = (HashSet<String>) user.getDisabledTopicSet();
          if ( disabledTopicsSet.contains(notification.getNotificationType()) ) {
            notification.setRead(true);
          }
        }

        try {
          DAO notificationDAO = (DAO) x.get("localNotificationDAO");
          notificationDAO.put_(x, notification);
        } catch (Throwable t) {
          Logger logger = (Logger) x.get("logger");
          logger.error("Failed to send notification: " + t, t);
        }
      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode: `
      AuthService auth = (AuthService) x.get("auth");
      if ( ! checkOwnership(x) && ! auth.check(x, "notificationsetting.create") )  throw new AuthorizationException(LACKS_CREATE_PERMISSION);
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
      AuthService auth = (AuthService) x.get("auth");
      if ( ! checkOwnership(x) && ! auth.check(x, createPermission("update")) ) throw new AuthorizationException(LACKS_UPDATE_PERMISSION);
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
      AuthService auth = (AuthService) x.get("auth");
      if ( ! checkOwnership(x) && ! auth.check(x, createPermission("remove")) ) throw new AuthorizationException(LACKS_DELETE_PERMISSION);
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
      AuthService auth = (AuthService) x.get("auth");
      if ( ! checkOwnership(x) && ! auth.check(x, createPermission("read")) ) throw new AuthorizationException(LACKS_READ_PERMISSION);
      `
    },
    {
      name: 'checkOwnership',
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Boolean',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();

        if ( user == null ) return false;

        return getUserJunction() != null && ( getUserJunction().getTargetId() == user.getId() ) || getOwner() == user.getId();
      `
    },
    {
      name: 'createPermission',
      args: [
        { name: 'operation', type: 'String' }
      ],
      type: 'String',
      javaCode: `
        return "notificationsetting." + operation + "." + getId();
      `
    }
  ]
});
