package foam.nanos.cron;

import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.notification.Notification;

import java.util.Date;

import static foam.nanos.http.Command.select;


public class RemoveExpiredNotificationCronjob implements ContextAgent {
  @Override
  public void execute(X x){
    DAO notificationDAO = (DAO) x.get("notificationDAO");
    notificationDAO.where(MLang.LTE(Notification.EXPIRY_DATE, new Date())).select(new AbstractSink() {
      @Override
      public void put(Object o, Detachable d) {
        Notification notification = (Notification) o;
        notificationDAO.remove(notification);
      }
    });
  }
}
