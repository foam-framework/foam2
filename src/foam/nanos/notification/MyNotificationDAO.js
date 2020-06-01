/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'MyNotificationDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.*',
    'foam.mlang.MLang',
    'foam.mlang.predicate.AbstractPredicate',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.notification.Notification',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User'
  ],

  documentation: `
    DAO decorator that adds a filter to retrieve only the context subject user's notifications
  `,


  methods: [
    {
      name: 'select_',
      javaCode: `
        User user = ((Subject) x.get("subject")).getRealUser();

        return getDelegate().where(
            MLang.EQ(Notification.USER_ID, user.getId())
          ).select_(x, sink, skip, limit, order, predicate);
      `
    }
  ],
});
