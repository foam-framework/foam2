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
          send(user, notif, x);
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
          send(user, notif, x);
        }
      });
    }

    if ( SafetyUtil.isEmpty(notif.getGroupId()) && ! notif.getBroadcasted() ) {
      return super.put_(x, notif);
    }

    return obj;
  }

  public void send(User user, Notification notification, X x) {
    NotificationSetting notificationSetting = new NotificationSetting.Builder(x).build();
    notificationSetting.sendNotification(x, user, notification);
  }
}
