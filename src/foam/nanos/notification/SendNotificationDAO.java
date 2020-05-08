package foam.nanos.notification;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.mlang.sink.Count;
import foam.nanos.auth.LifecycleState;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import static foam.mlang.MLang.*;

public class SendNotificationDAO
  extends ProxyDAO
{

  public SendNotificationDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    DAO userDAO = (DAO) x.get("localUserDAO");
    Notification notif = (Notification) obj;

    if ( notif.getBroadcasted() ) {
      userDAO.select(new AbstractSink() {
        @Override
        public void put(Object o, Detachable d) {
          User user = (User) o;
          send(x, user, notif);
        }
      });
    } else if ( ! SafetyUtil.isEmpty(notif.getGroupId()) ) {
      DAO receivers = userDAO.where(
                                    AND(
                                        EQ(User.GROUP, notif.getGroupId()),
                                        EQ(User.LIFECYCLE_STATE, LifecycleState.ACTIVE)
            ));
      Count count = (Count) receivers.select(new Count());
      Logger logger = (Logger) x.get("logger");
      if ( count.getValue() == 0 ) {
        logger.warning("Notification " + notif.getNotificationType() +
          " will not be saved to notificationDAO because no users exist in the group " + notif.getGroupId());
      }
      receivers.select(new AbstractSink() {
        @Override
        public void put(Object o, Detachable d) {
          User user = (User) o;
          send(x, user, notif);
        }
      });
    }

    if ( SafetyUtil.isEmpty(notif.getGroupId()) && ! notif.getBroadcasted() ) {
      Notification notification = notif;
      User nofifUser = (User) userDAO.find(notif.getUserId());
      if ( nofifUser != null ) {
        NotificationSetting notificationSetting = getNotificationSetting(x, nofifUser);

        // We cannot permanently disable in-app notifications, so mark them read automatically
        if ( ! notificationSetting.getEnabled() && ! notif.getRead() ) {
          notification = (Notification) notif.fclone();
          notification.setRead(true);
        }
      }

      return super.put_(x, notification);
    }

    return obj;
  }

  public void send(X x, User user, Notification notification) {
    // Retrieve the notification settings for this user
    NotificationSetting notificationSetting = getNotificationSetting(x, user);

    // Send the notification
    notificationSetting.sendNotification(x, user, notification);
  }

  private NotificationSetting getNotificationSetting(X x, User user) {
    DAO notificationSettingDAO = (DAO) x.get("localNotificationSettingDAO");

    // Retrieve the notification settings for this user
    NotificationSetting notificationSetting = null;
    if ( user != null ) {
      notificationSetting = (NotificationSetting) notificationSettingDAO.find(
        AND(
          EQ(NotificationSetting.OWNER, user.getId()),
          CLASS_OF(NotificationSetting.class)
        ));
    }

    // If no notification settings exist, use a new instance as notifications are assumed to be 'on'
    return notificationSetting != null ? notificationSetting : new NotificationSetting.Builder(x).setOwner(user.getId()).build();
  }
}
