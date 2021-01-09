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
    'static foam.mlang.MLang.EQ',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.util.Auth',
    'foam.util.SafetyUtil',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.ServiceProvider',
    'foam.nanos.auth.ServiceProviderAware',
    'foam.nanos.auth.ServiceProviderAwareDAO',
    'foam.nanos.auth.ServiceProviderAwareSink',
    'foam.nanos.auth.GroupPermissionJunction',
    'foam.nanos.auth.test.DummySp',
    'foam.nanos.auth.LifecycleState',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map',
    'javax.security.auth.AuthPermission'
  ],

  properties: [
    {
      name: 'spid1',
      class: 'String',
      javaFactory: 'return java.util.UUID.randomUUID().toString().toLowerCase().split("-")[0];'
    },
    {
      name: 'spid2',
      class: 'String',
      javaFactory: 'return java.util.UUID.randomUUID().toString().toLowerCase().split("-")[0];'
    }
  ],
  
  methods: [
    {
      name: 'runTest',
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
System.out.println("UUID: "+getSpid1());
        ((DAO) x.get("localServiceProviderDAO")).put(new ServiceProvider.Builder(x).setId(getSpid1()).build());
        ((DAO) x.get("localServiceProviderDAO")).put(new ServiceProvider.Builder(x).setId(getSpid2()).build());
        ((DAO) x.get("localGroupDAO")).put(new Group.Builder(x).setId("test").build());
        ((DAO) x.get("localGroupDAO")).put(new Group.Builder(x).setId("test2").build());
        ((DAO) x.get("localGroupDAO")).put(new Group.Builder(x).setId(getSpid2()).build());
        ((DAO) x.get("localGroupDAO")).put(new Group.Builder(x).setId("fail").build());

        DAO groupPermissionJunctionDAO = (DAO) x.get("localGroupPermissionJunctionDAO");
        groupPermissionJunctionDAO.where(EQ(GroupPermissionJunction.SOURCE_ID, "test")).removeAll();
        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(x).setSourceId("test").setTargetId("serviceprovider.read."+getSpid1()).build());
        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(x).setSourceId("test2").setTargetId("serviceprovider.read."+getSpid1()).build());

        foam.nanos.app.AppConfig appConfig = (foam.nanos.app.AppConfig) ((FObject) x.get("appConfig")).fclone();
        appConfig.setDefaultSpid(getSpid1());
        X y = x.put("appConfig", appConfig);

        testReference(y);
      `
    },
    {
      name: 'testReference',
      args: [
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        DAO groupPermissionJunctionDAO = (DAO) x.get("localGroupPermissionJunctionDAO");

        DAO userDAODelegate = new MDAO(User.getOwnClassInfo());
        DAO userDAO = new foam.nanos.auth.AuthorizationDAO.Builder(x)
          .setAuthorizer(new foam.nanos.auth.AuthorizableAuthorizer(User.class.getSimpleName().toLowerCase()))
          .setDelegate(
            new ServiceProviderAwareDAO.Builder(x)
              .setDelegate(userDAODelegate)
              .build())
          .build();
        X y = x.put("userDAO", userDAO);
        y = y.put("localUserDAO", userDAO);

        DAO dao =
          new foam.nanos.auth.AuthorizationDAO.Builder(y)
          .setAuthorizer(new foam.nanos.auth.StandardAuthorizer(DummySp.class.getSimpleName().toLowerCase()))
          .setDelegate(new ServiceProviderAwareDAO.Builder(y)
            .setDelegate(new foam.dao.SequenceNumberDAO.Builder(y)
              .setDelegate(new MDAO(DummySp.getOwnClassInfo()))
              .build())
            .build())
          .build();
        y = y.put("dummySpDAO", dao);
        y = y.put("localDummySpDAO", dao);

       User ctxUser = new User.Builder(y)
          .setId(99995)
          .setEmail("test@example.com")
          .setSpid(getSpid1())
          .setGroup("admin")
          .setLifecycleState(LifecycleState.ACTIVE)
          .build();
        ctxUser = (User) userDAODelegate.put(ctxUser);
        test(ctxUser.getSpid().equals(getSpid1()), "admin.spid = "+ctxUser.getSpid());
        y = Auth.sudo(y, ctxUser);
        userDAO = userDAO.inX(y);
        dao = dao.inX(y);

        User user1 = new User.Builder(y)
          .setId(89996)
          .setFirstName("user_one")
          .setLastName("lastname")
          .setEmail("user1@example.com")
          .setGroup("test")
          .setLifecycleState(LifecycleState.ACTIVE)
          .build();
        user1 = (User) userDAO.put_(y, user1);
        test(user1.getSpid().equals(getSpid1()), "user1.spid = "+user1.getSpid());

        User user2 = new User.Builder(y)
          .setId(89995)
          .setFirstName("user_two")
          .setLastName("lastname")
          .setEmail("user2@example.com")
          .setGroup("test")
          .setLifecycleState(LifecycleState.ACTIVE)
          .build();
        user2 = (User) userDAO.put_(y, user2);
        test(user2.getSpid().equals(getSpid1()), "user2.spid = "+user2.getSpid());

        User user3 = new User.Builder(y)
          .setId(89994)
          .setFirstName("user_three")
          .setLastName("lastname")
          .setEmail("user3@example.com")
          .setGroup("test")
          .setLifecycleState(LifecycleState.ACTIVE)
          .build();
        user3 = (User) userDAO.put_(y, user3);
        test(user3.getSpid().equals(getSpid1()), "user3.spid = "+user3.getSpid());

        User user4 = new User.Builder(y)
        .setId(89993)
        .setFirstName("user_four")
        .setLastName("lastname")
        .setEmail("user4@example.com")
        .setGroup(getSpid2())
        .setLifecycleState(LifecycleState.ACTIVE)
        .setSpid(getSpid2())
        .build();
        user4 = (User) userDAO.put_(y, user4);
        test(user4.getSpid().equals(getSpid2()), "user4.spid = "+user4.getSpid());

        DummySp ns1 = new DummySp.Builder(y).setOwner(user1.getId()).build();
        ns1 = (DummySp) dao.put(ns1).fclone();
        DummySp ns2 = new DummySp.Builder(y).setOwner(user2.getId()).build();
        ns2 = (DummySp) dao.put(ns2);
        DummySp ns3 = new DummySp.Builder(y).setOwner(user3.getId()).build();
        ns3 = (DummySp) dao.put(ns3);

        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(y).setSourceId("test").setTargetId("service.DummySpDAO").build());
        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(y).setSourceId("test").setTargetId("dummysp.read." + ns1.getId()).build());

        y = Auth.sudo(y, user1);
        dao = dao.inX(y);

        DummySp ns = (DummySp) dao.find_(y, ns1.getId());
        test(ns != null, "ReferenceTest find owned by context user.");

        ArraySink sink = new ArraySink();
        dao.select(sink);
        List<DummySp> nss = sink.getArray();
        test (nss.size() == 1, "ReferenceTest DAO select. expected: 1, found: "+nss.size());

        ns = (DummySp) dao.find(ns2.getId());
        test(ns == null, "ReferenceTest find not owned by context user.");

        sink = new ArraySink();
        dao.select(sink);
        nss = sink.getArray();
        test (nss.size() == 1, "ReferenceTest DAO select filtered on spid. expected: 1, found: "+nss.size());

        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(y).setSourceId("test").setTargetId("dummysp.read." + ns2.getId()).build());

        y = Auth.sudo(y, user1);
        dao = dao.inX(y);

        sink = new ArraySink();
        dao.select(sink);
        nss = sink.getArray();
        test (nss.size() == 2, "ReferenceTest DAO select filtered on permission. expected: 2, found: "+nss.size());

        // select predicate tests.
        DAO where = dao.where(EQ(DummySp.ID, ns2.getId()));
        sink = new ArraySink();
        where.select(sink);
        nss = sink.getArray();
        test (nss.size() == 1, "ReferenceTest DAO select filtered on predicate. expected: 1, found: "+nss.size());

        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(y).setSourceId("test").setTargetId("dummysp.read." + ns3.getId()).build());

        // select before changing spid
        sink = new ArraySink();
        dao.select(sink);
        nss = sink.getArray();
        test (nss.size() == 3, "ReferenceTest DAO select filtered on permission. expected: 3, found: "+nss.size());

        // select before changing spid
        where = dao.where(EQ(DummySp.ID, ns3.getId()));
        sink = new ArraySink();
        where.select(sink);
        nss = sink.getArray();
        test (nss.size() == 1, "ReferenceTest DAO select filtered on predicate. expected: 1, found: "+nss.size());

        // change spid
        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(y).setSourceId("test").setTargetId("dummysp.update." + ns3.getId()).build());
        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(y).setSourceId("test").setTargetId("serviceprovider.update."+getSpid1()).build());
        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(y).setSourceId("test").setTargetId("serviceprovider.update."+getSpid2()).build());
        test(ns3.getSpid().equals(getSpid1()), "before ns3.spid = "+ns3.getSpid());
        ns3 = (DummySp) ns3.fclone();
        ns3.setSpid(getSpid2()); 
        ns3 = (DummySp) dao.put(ns3);
        test(ns3.getSpid().equals(getSpid2()), "after ns3.spid = "+ns3.getSpid());
      
        y = Auth.sudo(y, user1);
        dao = dao.inX(y);

        sink = new ArraySink();
        dao.select(sink);
        nss = sink.getArray();
        test (nss.size() == 2, "ReferenceTest DAO select filtered on permission. expected: 2, found: "+nss.size());

        // select predicate that should filter by permission
        where = dao.where(EQ(DummySp.ID, ns2.getId()));
        sink = new ArraySink();
        where.select(sink);
        nss = sink.getArray();
        test (nss.size() == 1, "ReferenceTest DAO select filtered on predicate. expected: 1, found: "+nss.size());

        // select predicate that should filter by spid first.
        where = dao.where(EQ(DummySp.ID, ns3.getId()));
        sink = new ArraySink();
        where.select(sink);
        nss = sink.getArray();
        test (nss.size() == 0, "ReferenceTest DAO select filtered on spid. expected: 0, found: "+nss.size());

        // test user in spid 'other' can't select it's own members as it's group does not have read permission
        y = Auth.sudo(y, user4);
        dao = dao.inX(y);
        sink = new ArraySink();
        try {
          dao.select(sink);
          nss = sink.getArray();
          test (false, "ReferenceTest DAO select filtered on spid. expected: AuthorizationException, found: "+nss.size());
        } catch (AuthorizationException e) {
          test (true, "ReferenceTest DAO select filtered on spid.");
        }

        // test that it is found by a user on the new spid 
        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(x).setSourceId(getSpid2()).setTargetId("serviceprovider.read."+getSpid2()).build());
        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(x).setSourceId(getSpid2()).setTargetId("service.DummySpDAO").build());
        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(x).setSourceId(getSpid2()).setTargetId("dummysp.read.*").build());
        sink = new ArraySink();
        dao.select(sink);
        nss = sink.getArray();
        foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
        for ( DummySp ds : nss ) {
          logger.info(ds);
        }
        test (nss.size() == 1, "ReferenceTest DAO select filtered on spid. expected: 1, found: "+nss.size());

        // delete/remove
     `
    }
  ]
});
