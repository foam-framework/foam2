/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.notification;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.LifecycleState;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import foam.nanos.notification.NotificationSetting;
import foam.nanos.notification.EmailSetting;
import foam.nanos.notification.email.EmailMessage;
import foam.util.Emails.EmailsUtility;
import java.util.Arrays;
import java.util.List;
import static foam.mlang.MLang.*;

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
    DAO          userDAO         = (DAO) x.get("localUserDAO");
    DAO          settingDAO      = (DAO) x.get("localNotificationSettingDAO");
    AppConfig    config          = (AppConfig) x.get("appConfig");
    Notification notification    = (Notification) obj;
    User         user            = (User) userDAO.find(notification.getUserId());
    Notification oldNotification = (Notification) getDelegate().find(obj);

    if ( oldNotification != null ) 
      return super.put_(x, obj);

    if ( ! notification.getEmailIsEnabled() || user == null ) 
      return super.put_(x, obj);

    if ( user.getLifecycleState() != LifecycleState.ACTIVE )
      return super.put_(x, obj);

    if ( "notification".equals(notification.getEmailName()) ) {
      notification.getEmailArgs().put("type", notification.getNotificationType());
      notification.getEmailArgs().put("link", config.getUrl());
    }
  
    // Retrieve the email settings for this user
    EmailSetting emailSetting = (EmailSetting) settingDAO.find(
      AND(
        EQ(NotificationSetting.OWNER, user.getId()),
        CLASS_OF(EmailSetting.class)
      ));

    // If no email settings exist, use a new instance as notifications are assumed to be 'on'
    emailSetting = (emailSetting != null) ? emailSetting : new EmailSetting.Builder(x).setOwner(user.getId()).build();

    // Send the email notification
    emailSetting.sendNotification(x, user, notification);

    return super.put_(x, notification);
  }
}
