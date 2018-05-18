package foam.nanos.notification;
import foam.core.Detachable;
import foam.dao.AbstractSink;
import foam.nanos.notification.email.EmailMessage;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;

import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

public class EmailEnabledDAO extends ProxyDAO {

  public EmailEnabledDAO(DAO delegate) {
    setDelegate(delegate);
  }

  public EmailEnabledDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }
  @Override
  public FObject put_(X x, FObject obj) {
    DAO userDAO = (DAO) x.get("userDAO");
    AppConfig config     = (AppConfig) x.get("appConfig");
    EmailService email      = (EmailService) x.get("email");
    ArrayList<String> users = new ArrayList<>();

    Notification notif = (Notification) obj;
    User user = (User) userDAO.find(notif.getUserId());


    Notification oldNotif = (Notification) getDelegate().find(obj);

    if ( oldNotif != null )
      return super.put_(x, obj);

    if ( ! notif.getEmailIsEnabled() )
      return super.put_(x, obj);


    if ( notif.getEmailName() == "notification" ) {
      notif.getEmailArgs().put("type", notif.getNotificationType());
      notif.getEmailArgs().put("link", config.getUrl());
    }

    if ( notif.getUserId() != null ) {
      if ( Arrays.asList(user.getDisabledNotifsEmail()).contains(notif.getNotificationType()) )
        return super.put_(x,obj);
      users.add(user.getEmail());

    }

    if ( notif.getGroupId() != null ){
      userDAO.where(EQ(User.GROUP, notif.getGroupId())).select(new AbstractSink() {
        @Override
        public void put(Object o, Detachable d) {
          User curUser = (User) o;
          if ( ! Arrays.asList(curUser.getDisabledNotifsEmail()).contains(notif.getNotificationType()) && curUser.getDisabledNotifsEmail() != null )
            users.add(curUser.getEmail());
        }
      });
    }

    if ( notif.getBroadcasted() ){
      userDAO.select(new AbstractSink() {
        @Override
        public void put(Object o, Detachable d) {
          User curUser = (User) o;
          if ( ! Arrays.asList(curUser.getDisabledNotifsEmail()).contains(notif.getNotificationType()) && curUser.getDisabledNotifsEmail() != null )
            users.add(curUser.getEmail());
        }
      });
    }

    EmailMessage message = new EmailMessage();
    message.setTo(users.toArray(new String[users.size()]));

    try {
      email.sendEmailFromTemplate(user, message, notif.getEmailName(), notif.getEmailArgs());
    } catch(Throwable t) {
      ((Logger) x.get(Logger.class)).error("Error sending notification email.", t);
    }


    return super.put_(x,notif);

  }
}