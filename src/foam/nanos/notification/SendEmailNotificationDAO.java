package foam.nanos.notification;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import java.util.Arrays;

// If notification's emailEnabled is true, the decorator creates an email based on provided or default emailTemplate, sets the reciever based on notification userId/groupId/broadcasted
public class SendEmailNotificationDAO extends ProxyDAO {

  public SendEmailNotificationDAO(DAO delegate) {
    setDelegate(delegate);
  }

  public SendEmailNotificationDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }
  @Override
  public FObject put_(X x, FObject obj) {
    DAO userDAO = (DAO) x.get("localUserDAO");
    AppConfig config     = (AppConfig) x.get("appConfig");
    EmailService email      = (EmailService) x.get("email");
    Notification notif = (Notification) obj;
    User user = (User) userDAO.find(notif.getUserId());
    Notification oldNotif = (Notification) getDelegate().find(obj);

    if ( oldNotif != null )
      return super.put_(x, obj);

    if ( ! notif.getEmailIsEnabled() )
      return super.put_(x, obj);

    if ( Arrays.asList(user.getDisabledTopicsEmail()).contains(notif.getNotificationType()) )
      return super.put_(x,obj);

    if ( "notification".equals(notif.getEmailName()) ) {
      notif.getEmailArgs().put("type", notif.getNotificationType());
      notif.getEmailArgs().put("link", config.getUrl());
    }

    EmailMessage message = new EmailMessage();
    message.setTo(new String[]{user.getEmail()});

    try {
      email.sendEmailFromTemplate(user, message, notif.getEmailName(), notif.getEmailArgs());
    } catch(Throwable t) {
      System.out.println("Error sending notification email. Error: " + t);
    }

    return super.put_(x,notif);

  }
}
