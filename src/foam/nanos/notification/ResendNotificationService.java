package foam.nanos.notification;
import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.notification.ResendNotificationServiceInterface;
import foam.nanos.NanoService;
import foam.nanos.notification.Notification;

public class ResendNotificationService extends ContextAwareSupport implements ResendNotificationServiceInterface, NanoService {

  protected DAO userDAO;

  @Override
  public void resend(X x, long userId, Notification notification) {
    User user = (User) userDAO.find(userId);
    user.doNotify(x, notification);
  }

  @Override
  public void start() {
      userDAO = (DAO) getX().get("userDAO");
  }

}