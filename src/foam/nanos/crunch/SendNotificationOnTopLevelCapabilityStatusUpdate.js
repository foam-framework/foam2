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
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.notification.Notification',
    'java.lang.StringBuilder',
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
          Capability cap = (Capability) ((DAO) x.get("capabilityDAO")).find(((String)junction.getTargetId()));
          if ( ! cap.getVisible() ) return;

          DAO notificationDAO = (DAO) x.get("notificationDAO");

          StringBuilder sb = new StringBuilder("The Capability '")
          .append(((String)junction.getTargetId()))
          .append("' has been set to ")
          .append(junction.getStatus())
          .append(".");

          Notification notification = new Notification();
          notification.setUserId(junction.getSourceId());
          notification.setNotificationType("Capabiltiy Status Update");
          notification.setIssuedDate(new Date());
          notification.setBody(sb.toString());
          notificationDAO.put(notification);
        }
      }, "Send Notification On Top Level Capability Status Update");
      `
    }
  ]
});