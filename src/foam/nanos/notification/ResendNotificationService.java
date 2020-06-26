/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.notification;
import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.notification.ResendNotificationServiceInterface;
import foam.nanos.notification.Notification;

public class ResendNotificationService extends ContextAwareSupport implements ResendNotificationServiceInterface {

  @Override
  public void resend(X x, long userId, Notification notification) {
    DAO userDAO = (DAO) x.get("userDAO");
    User user = (User) userDAO.find(userId);
    user.doNotify(x, notification);
  }
}