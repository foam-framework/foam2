/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.action',
  name: 'SendNotification',

  documentation: `An action that just puts a notification to the notificationDAO. A notification object must be provided in the rule declaration,
  An example of usage: When a pizza order comes in from a customer, send a notification to the pizza chef that an order was received.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.core.ContextAgent',
    'foam.nanos.notification.Notification',
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.notification.Notification',
      name: 'notification'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
         agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              if ( getNotification() != null ) {
                DAO userDAO = (DAO) x.get("localUserDAO");
                User user = (User) userDAO.find(getNotification().getUserId());
                if ( user != null ) {
                  user.doNotify(x, getNotification());
                  return;
                }
              }
              
              DAO notificationDAO = (DAO) x.get("localNotificationDAO");
              if ( getNotification() != null && notificationDAO != null ) {
                try {
                  notificationDAO.put(getNotification());
                }
                catch (Exception e) {
                  Logger logger = (Logger) x.get("logger");
                  logger.error("Failed to put notification: " + e);
                };
              }
            }
         },"send a notification");
      `
    }
  ]
});
