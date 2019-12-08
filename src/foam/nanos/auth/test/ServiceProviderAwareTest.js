/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.test',
  name: 'ServiceProviderAwareTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.ProxySink',
    'foam.dao.Sink',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.util.Auth',
    'foam.util.SafetyUtil',
    'foam.nanos.auth.ServiceProviderAware',
    'foam.nanos.auth.ServiceProviderAwareDAO',
    'foam.nanos.auth.ServiceProviderAwareSink',
    'foam.nanos.auth.GroupPermissionJunction',
    'foam.nanos.notification.NotificationSetting',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map',
    'javax.security.auth.AuthPermission'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        ((DAO) x.get("localGroupDAO")).put(new Group.Builder(x).setId("test").build());
        ((DAO) x.get("localGroupDAO")).put(new Group.Builder(x).setId("fail").build());

         // permission setup
//        DAO groupPermissionJunctionDAO = (DAO) x.get("localGroupPermissionJunctionDAO");
//        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(x).setSourceId("test").setTargetId("user.read.*").build());
//        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(x).setSourceId("fail").setTargetId("user.read.*").build());
//        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(x).setSourceId("test").setTargetId("spid.read.test").build());
//        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(x).setSourceId("fail").setTargetId("spid.read.fail").build());

        foam.nanos.app.AppConfig appConfig = (foam.nanos.app.AppConfig) x.get("appConfig");
        appConfig.setDefaultSpid("test");
        X y = x.put("appConfig", appConfig);

        User user = new User.Builder(x)
          .setId(99995)
          .setEmail("test@example.com")
          .setSpid("test")
          .setGroup("admin")
          .build();
        y = Auth.sudo(y, user);

        testAware(y);
        testReference(y);
      `
    },
    {
      name: 'testAware',
      args: [
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");

        User ctxUser = (User) x.get("user");
        DAO delegate = new MDAO(User.getOwnClassInfo());
        DAO dao = (DAO) new ServiceProviderAwareDAO.Builder(x).setDelegate(delegate).build();
        ctxUser = (User) delegate.put_(x, ctxUser);
        int idx = 0;

        test("test".equals(ctxUser.getSpid()), "["+(idx++)+"] context user spid is set");
        User user = (User) new User.Builder(x)
          .setId(99999)
          .setFirstName("first")
          .setLastName("last")
          .setEmail("99999@test.com")
          .setGroup("test")
          .build();
        user = (User) dao.put(user);
        test(ctxUser.getSpid().equals(user.getSpid()), "["+(idx++)+"] ServiceProviderAwareDAO put sets spid. ");
        user = (User) dao.find(user.getId());
        test(user != null, "["+(idx++)+"] ServiceProviderAwareDAO find matches spid.");

        User user2 = (User) new User.Builder(x)
          .setId(99998)
          .setFirstName("first_two")
          .setLastName("last_two")
          .setEmail("99998@test.com")
          .setGroup("test")
          .build();
        user2 = (User) dao.put(user2);

        ArraySink sink = new ArraySink();
        dao.select(sink);
        List users = sink.getArray();
        test (users.size() == 3, "["+(idx++)+"]  ServiceProvicerAwareDAO select matched on spid. expected: 3, found: "+users.size());

        ctxUser = new User.Builder(x)
          .setId(99996)
          .setEmail("test@example.com")
          .setSpid("fail")
          .setGroup("admin")
          .build();
        ctxUser = (User) delegate.put_(x, ctxUser);
        X y = Auth.sudo(x, ctxUser);
        dao = dao.inX(y);

        user = (User) dao.find(user.getId());
        test(user != null, "["+(idx++)+"] ServiceProviderAwareDAO find does not filters admin.");

        sink = new ArraySink();
        dao.select(sink);
        users = sink.getArray();
        test (users.size() == 4, "["+(idx++)+"] ServiceProvicerAwareDAO select does not filter admin. expected: 4, found: "+users.size());

       ctxUser = new User.Builder(x)
          .setId(99996)
          .setEmail("test@example.com")
          .setSpid("fail")
          .setGroup("test")
          .build();
        ctxUser = (User) delegate.put_(y, ctxUser);
        test( ctxUser.getSpid().equals("fail"), "spid updated to fail");

        y = Auth.sudo(y, ctxUser);
        dao = dao.inX(y);

        user = (User) dao.find(user.getId());
        test(user == null, "["+(idx++)+"] ServiceProviderAwareDAO find filters on spid.");

        sink = new ArraySink();
        dao.select(sink);
        users = sink.getArray();
        test (users.size() == 1, "["+(idx++)+"] ServiceProvicerAwareDAO select filtered on spid. expected: 1, found: "+users.size());

        User user3 = (User) new User.Builder(x)
          .setId(99997)
          .setFirstName("three")
          .setLastName("last")
          .setEmail("three@test.com")
          .setGroup("test")
          .build();
        user3 = (User) dao.put(user3);

        user = (User) dao.find(user3.getId());
        test(user != null && user.getSpid().equals(ctxUser.getSpid()), "["+(idx++)+"] ServiceProviderAwareDAO find matches spid.");

        sink = new ArraySink();
        dao.select(sink);
        users = sink.getArray();
        test (users.size() == 2, "["+(idx++)+"] ServiceProvicerAwareDAO select filtered on spid. expected: 2, found: "+users.size());

      `
    },
    {
      name: 'testReference',
      args: [
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
         // permission setup
        DAO groupPermissionJunctionDAO = (DAO) x.get("localGroupPermissionJunctionDAO");
         groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(x).setSourceId("test").setTargetId("service.notificationSettingDAO").build());
        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(x).setSourceId("fail").setTargetId("service.notificationSettingDAO").build());
        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(x).setSourceId("test").setTargetId("notificationsetting.read.*").build());
        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(x).setSourceId("test").setTargetId("notificationsetting.create").build());
        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(x).setSourceId("fail").setTargetId("notificationsetting.read.*").build());
        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(x).setSourceId("fail").setTargetId("notificationsetting.create").build());

        User ctxUser = (User) x.get("user");
        DAO delegate = new foam.dao.SequenceNumberDAO.Builder(x)
                           .setDelegate(new MDAO(NotificationSetting.getOwnClassInfo()))
                           .build();
        DAO dao = (DAO) new ServiceProviderAwareDAO.Builder(x)
                            .setDelegate(delegate)
                            .setPropertyInfos(
                              new HashMap<String, PropertyInfo[]>() {{
                                put(NotificationSetting.class.getName(), new PropertyInfo[] { NotificationSetting.OWNER });
                              }}
                            )
                            .build();
        DAO userDAO = (DAO) x.get("localUserDAO");
        User user1 = new User.Builder(x)
          .setId(89996)
          .setFirstName("user_one")
          .setLastName("lastname")
          .setEmail("user1@example.com")
          .setGroup("test")
          .build();
        user1 = (User) userDAO.put_(x, user1);
        test("test".equals(user1.getSpid()), "ReferenceTest user1 spid test = "+user1.getSpid());

        // current context user is admin, so can set spid
        User user2 = new User.Builder(x)
          .setId(89995)
          .setFirstName("user_two")
          .setLastName("lastname")
          .setEmail("user2@example.com")
          .setSpid("fail")
          .setGroup("test")
          .build();
        user2 = (User) userDAO.put_(x, user2);
        test("fail".equals(user2.getSpid()), "ReferenceTest user2 spid fail = "+user2.getSpid());

        User user3 = new User.Builder(x)
          .setId(89994)
          .setFirstName("user_three")
          .setLastName("lastname")
          .setEmail("user3@example.com")
          .setGroup("test")
          .build();
        user3 = (User) userDAO.put_(x, user3);
        test("test".equals(user3.getSpid()), "ReferenceTest user3 spid test = "+user3.getSpid());

        NotificationSetting ns1 = new NotificationSetting.Builder(x).setOwner(user1.getId()).build();
        ns1 = (NotificationSetting) dao.put(ns1);
        NotificationSetting ns2 = new NotificationSetting.Builder(x).setOwner(user2.getId()).build();
        ns2 = (NotificationSetting) dao.put(ns2);
        NotificationSetting ns3 = new NotificationSetting.Builder(x).setOwner(user3.getId()).build();
        ns3 = (NotificationSetting) dao.put(ns3);

        X y = Auth.sudo(x, user1);
        NotificationSetting ns = (NotificationSetting) dao.inX(y).find(ns1.getId());
        test(ns != null, "ReferenceTest find same spid.");

        ArraySink sink = new ArraySink();
        dao.inX(y).select(sink);
        List nss = sink.getArray();
        test (nss.size() == 1, "ReferenceTest DAO select filtered on spid. expected: 1, found: "+nss.size());

       // user 2 - spid fail
        y = Auth.sudo(y, user2);
        ns = (NotificationSetting) dao.inX(y).find(ns1.getId());
        test(ns == null, "ReferenceTest find different spid.");

        sink = new ArraySink();
        dao.inX(y).select(sink);
        nss = sink.getArray();
        test (nss.size() == 1, "ReferenceTest DAO select filtered on spid. expected: 1, found: "+nss.size());

        // add read of other spid
         // permission setup
        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(y).setSourceId("test").setTargetId("user.read.89994").build());

        y = Auth.sudo(x, user1);
        sink = new ArraySink();
        dao.inX(y).select(sink);
        nss = sink.getArray();
        test (nss.size() == 2, "ReferenceTest DAO select filtered on spid. expected: 2, found: "+nss.size());

     `
    }
  ]
});
