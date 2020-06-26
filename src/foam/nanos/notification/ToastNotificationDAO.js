/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'ToastNotificationDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Detect if a newly put notification is transient or not, 
                  if it is return, else put to server side notificationDAO`,

  methods: [
    {
      name: 'put_',
      javaCode: `
        Notification notification = (Notification) obj;
        if ( notification.getTransient() == true ) {
          return notification;
        }
        return getDelegate().put_(x, notification);
      `
    }
  ]
});
