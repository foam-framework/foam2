/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'SendNotificationOnTopLevelCapabilityStatusUpdate',

  documentation: 'Rule to notify user on every visible Capability status update.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.notification.Notification',
    'java.util.Date'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          UserCapabilityJunction junction = (UserCapabilityJunction) obj;
          Capability cap = (Capability) junction.findTargetId(x);
          User user = (User) junction.findSourceId(x);
          
          if ( cap == null || ! cap.getVisible() ) return;

          DAO notificationDAO = (DAO) x.get("notificationDAO");

          StringBuilder sb = new StringBuilder("The Capability '")
          .append(cap.getName())
          .append("' has been set to ")
          .append(junction.getStatus())
          .append(".");

          Notification notification = new Notification();

          // if the UserCapabilityJunction belongs to an actual user, send the notification to the user.
          // otherwise, send the notification to the group the user is under
          if ( user.getClass().equals(User.class) ) notification.setUserId(user.getId());
          else  notification.setGroupId(user.getGroup());

          notification.setNotificationType("Capability Status Update");
          notification.setCreated(new Date());
          notification.setBody(sb.toString());
          notificationDAO.put(notification);
        }
      }, "Send Notification On Top Level Capability Status Update");
      `
    }
  ]
});