package foam.nanos.cron;

import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.notification.Notification;
import java.util.Date;

public class RemoveExpiredNotificationCronjob implements ContextAgent {
  @Override
  public void execute(X x){
    DAO notificationDAO = (DAO) x.get("notificationDAO");
    notificationDAO.where(MLang.LTE(Notification.EXPIRY_DATE, new Date())).removeAll();
  }
}
