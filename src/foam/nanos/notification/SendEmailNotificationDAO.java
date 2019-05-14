/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.notification;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.mlang.sink.Map;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import foam.util.SafetyUtil;

import java.util.*;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.MAP;

// If notification's emailEnabled is true, the decorator creates an email based
// on provided or default emailTemplate, sets the receiver based on notification
// userId/groupId/broadcasted.
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
    DAO localUserDAO  = (DAO) x.get("localUserDAO");
    Notification notif = (Notification) obj;
    Notification oldNotif = (Notification) getDelegate().find(obj);

    // Check if the notification should send emails.
    if ( oldNotif != null || ! notif.getEmailIsEnabled() ) return super.put_(x, obj);

    // A list of user ids we're going to send emails to.
    Set ids = new HashSet<Long>();

    // If `broadcasted` is set, add all users in the system to the list.
    if ( notif.getBroadcasted() ) {
      ArraySink arraySink = new ArraySink();
      Map s = (Map) localUserDAO.select(MAP(User.ID, arraySink));
      List<Long> userIds = ((ArraySink) s.getDelegate()).getArray();
      ids.addAll(userIds);
    } else {
      // If `userId` is set, add to the list.
      long userId = notif.getUserId();
      if ( userId != 0 ) {
        ids.add(userId);
      }

      // If `groupId` is set, add all users in that group to the list.
      String groupId = notif.getGroupId();
      if ( ! SafetyUtil.isEmpty(groupId) ) {
        ArraySink arraySink = new ArraySink();
        Map s = (Map) localUserDAO.where(EQ(User.GROUP, groupId)).select(MAP(User.ID, arraySink));
        List<Long> userIds = ((ArraySink) s.getDelegate()).getArray();
        ids.addAll(userIds);
      }
    }

    // Send the email to each user in the list.
    for ( Object id : ids ) {
      User u = (User) localUserDAO.inX(x).find(id);
      sendEmail(x, notif, u);
    }

    return super.put_(x,notif);
  }

  /**
   * Send an email to a User based on a Notification.
   * @param x The context to use.
   * @param notification The notification.
   * @param user The user to send the email to.
   */
  public void sendEmail(X x, Notification notification, User user) {
    if ( user.getDisabledTopicsEmail() != null ) {
      List disabledTopics = Arrays.asList(user.getDisabledTopicsEmail());
      if ( disabledTopics.contains(notification.getNotificationType()) ) return;
    }

    AppConfig config = (AppConfig) x.get("appConfig");
    if ( "notification".equals(notification.getEmailName()) ) {
      notification.getEmailArgs().put("type", notification.getNotificationType());
      notification.getEmailArgs().put("link", config.getUrl());
    }

    EmailMessage message = new EmailMessage();
    message.setTo(new String[]{user.getEmail()});

    try {
      EmailService email = (EmailService) x.get("email");
      if ( foam.util.SafetyUtil.isEmpty(notification.getEmailName()) ) {
        message.setSubject(notification.getTemplate());
        message.setBody(notification.getBody());
        email.sendEmail(x, message);
      } else {
        email.sendEmailFromTemplate(x, user, message, notification.getEmailName(), notification.getEmailArgs());
      }
    } catch(Throwable t) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Error sending notification email message: " + message + ". Error: " + t);
    }
  }
}
