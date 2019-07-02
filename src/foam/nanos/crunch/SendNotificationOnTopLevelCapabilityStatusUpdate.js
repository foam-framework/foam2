foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'SendNotificationOnTopLevelCapabilityStatusUpdate',

  documentation: 'rule to notify user on every visible Capability status update.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.notification.Notification',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.util.Date',
    'java.lang.StringBuilder',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          DAO notificationDAO = (DAO) x.get("notificationDAO");
          UserCapabilityJunction junction = (UserCapabilityJunction) obj;

          StringBuilder sb = new StringBuilder("The Capability '")
          .append(((String)junction.getTargetId()))
          .append("' has been set to ")
          .append(junction.getStatus())
          .append(".");

          Notification notification = new Notification();
          notification.setUserId(junction.getSourceId());
          notification.setNotificationType("Capabiltiy Status Uodate");
          notification.setIssuedDate(new Date());
          notification.setBody(sb.toString());
          notificationDAO.put(notification);
        }
      }); 
      `
    }
  ]
});