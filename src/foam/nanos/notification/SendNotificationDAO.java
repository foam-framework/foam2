package foam.nanos.notification;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;

import java.util.ArrayList;
import java.util.Arrays;

import static foam.mlang.MLang.EQ;

public class SendNotificationDAO extends ProxyDAO {


  public SendNotificationDAO(DAO delegate) {
    setDelegate(delegate);
  }

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
    } else if ( notif.getGroupId() != null ){

      userDAO.where(EQ(User.GROUP, notif.getGroupId())).select(new AbstractSink() {
        @Override
        public void put(Object o, Detachable d) {
          User user = (User) o;
          send(user, notif, x);
        }
      });
    }

    if ( notif.getGroupId() == null && ! notif.getBroadcasted() ) {
      return super.put_(x,notif);
    }
    return obj;
  }

  public void send(User user, Notification notif, X x) {
    Notification notification = new Notification();
    notification.setUserId(user.getId());
    notification.setBody(notif.getBody());
    notification.setEmailArgs(notif.getEmailArgs());
    notification.setEmailIsEnabled(notif.getEmailIsEnabled());
    notification.setEmailName(notif.getEmailName());
    notification.setExpiryDate(notif.getExpiryDate());
    notification.setIssuedDate(notif.getIssuedDate());
    notification.setNotificationType(notif.getNotificationType());
    ((DAO) x.get("notificationDAO")).put(notification);
  }
}

