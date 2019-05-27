package foam.nanos.notification;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import static foam.mlang.MLang.EQ;

public class SendNotificationDAO extends ProxyDAO {

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
      userDAO.where(EQ(User.GROUP, notif.getGroupId())).select(new AbstractSink() {
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

  public void send(User user, Notification notif, X x) {
    Notification notification = (Notification) notif.fclone();
    notification.setId(0L);
    notification.setUserId(user.getId());
    notification.setBroadcasted(false);
    notification.setGroupId(null);
    ((DAO) x.get("notificationDAO")).put_(x, notification);
  }
}

