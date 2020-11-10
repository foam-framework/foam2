/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.test',
  name: 'UserAndGroupPermissionTest',
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
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.GroupPermissionJunction',
    'foam.nanos.auth.User',
    'foam.nanos.auth.ServiceProviderAwareDAO',
    'foam.nanos.auth.LifecycleState',
    'foam.util.Auth',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map',
    'foam.util.SafetyUtil',
    'javax.security.auth.AuthPermission'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        ((DAO) x.get("localGroupDAO")).put(new Group.Builder(x).setId("test").build());
        ((DAO) x.get("localGroupDAO")).put(new Group.Builder(x).setId("test2").build());
        ((DAO) x.get("localGroupDAO")).put(new Group.Builder(x).setId("fail").build());

        foam.nanos.app.AppConfig appConfig = (foam.nanos.app.AppConfig) ((FObject) x.get("appConfig")).fclone();
        appConfig.setDefaultSpid("spid");
        X y = x.put("appConfig", appConfig);

        testUserPermissions(y);
        testUserSpidPermissions(y);
      `
    },
    {
      name: 'testUserPermissions',
      args: [
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        DAO groupPermissionJunctionDAO = (DAO) x.get("localGroupPermissionJunctionDAO");
        groupPermissionJunctionDAO.where(EQ(GroupPermissionJunction.SOURCE_ID, "test")).removeAll();

        // not explicitly testing spids
        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(x).setSourceId("test").setTargetId("serviceprovider.create").build());
        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(x).setSourceId("test").setTargetId("serviceprovider.read.*").build());
        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(x).setSourceId("test").setTargetId("serviceprovider.update.*").build());

        DAO delegate = new MDAO(User.getOwnClassInfo());
        DAO dao = new foam.nanos.auth.AuthorizationDAO.Builder(x)
          .setDelegate(delegate)
          .setAuthorizer(new foam.nanos.auth.AuthorizableAuthorizer(User.class.getSimpleName().toLowerCase()))
          .build();

        X y = x.put("userDAO", dao);
        y = y.put("localUserDAO", dao);

        User user = null;

        User ctxUser = new User.Builder(y)
          .setId(99995)
          .setEmail("test@example.com")
          .setGroup("admin")
          .setLifecycleState(LifecycleState.ACTIVE)
          .build();
        ctxUser = (User) delegate.put(ctxUser);
        y = Auth.sudo(y, ctxUser);
        dao = dao.inX(y);

        User user1 = (User) new User.Builder(y)
          .setId(99999)
          .setFirstName("first")
          .setLastName("last")
          .setEmail("99999@test.com")
          .setGroup("test")
          .setLifecycleState(LifecycleState.ACTIVE)
          .build();

        user1 = (User) dao.put(user1);
        user1 = (User) dao.find(user1.getId());
        test(user1 != null, "find does not filter admin.");

        User user2 = (User) new User.Builder(x)
          .setId(99998)
          .setFirstName("first_two")
          .setLastName("last_two")
          .setEmail("99998@test.com")
          .setGroup("test")
          .setLifecycleState(LifecycleState.ACTIVE)
          .build();
        user2 = (User) dao.put(user2);

        user = (User) dao.find(user1.getId());
        test(user != null, "find does not filter admin (2).");

        ArraySink sink = new ArraySink();
        dao.select(sink);
        List users = sink.getArray();
        test (users.size() == 3, "select does not filter admin. expected: 3, found: "+users.size());

        y = Auth.sudo(y, user1);
        dao = dao.inX(y);

        // find self
        try {
          user = (User) dao.find(user1.getId());
          test (user != null, "find self");
        } catch (AuthorizationException e) {
          test(false, "find self should not throw AuthorizationException: "+e.getMessage());
        }

        sink = new ArraySink();
        dao.select(sink);
        users = sink.getArray();
        test (users.size() == 1, "select without user.read.id filtered to self. expected: 1, found: "+users.size());

        // find other
        try {
          user = (User) dao.find(user2.getId());
          test (user == null, "find without read.id filters entry.");
        } catch (AuthorizationException e) {
          test(true, "find without user.read.id throws AuthorizationException: "+e.getMessage());
        }

        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(y).setSourceId("test").setTargetId("user.read."+user2.getId()).build());

        // find other
        try {
          user = (User) dao.find(user2.getId());
          test ( user != null, "find with user.read.id finds entry.");
        } catch (AuthorizationException e) {
          test(false, "find with user.read.id should not throw AuthorizationException: "+e.getMessage());
        }

        sink = new ArraySink();
        dao.select(sink);
        users = sink.getArray();
        test (users.size() == 2, "select with user.read.id found self and id. expected: 2, found: "+users.size());

        // create/update
        User user3 = (User) new User.Builder(x)
          .setId(99997)
          .setFirstName("three")
          .setLastName("last")
          .setEmail("three@test.com")
          .setGroup("test")
          .setLifecycleState(LifecycleState.ACTIVE)
          .build();

        try {
          user3 = (User) dao.put(user3);
          test(false, "put without user.create should have thrown AuthorizationException");
        } catch (AuthorizationException e) {
          test(true, "put without user.create threw AuthorizationException: "+e.getMessage());
        }

        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(y).setSourceId("test").setTargetId("user.create").build());
        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(y).setSourceId("test").setTargetId("group.update.test").build());
        try {
          user3 = (User) dao.put(user3);
          test(user3 != null, "put with user.create should not throw AuthorizationException");
        } catch (AuthorizationException e) {
          test(false, "put with user.create should not throw AuthorizationException: "+e.getMessage());
        }

        try {
          user3 = (User) user3.fclone();
          user3.setEmail("three_three@test.com");
          user3 = (User) dao.put(user3);
          test(false, "put without user.update.* should have thrown AuthorizationException: "+user.getId());
        } catch (AuthorizationException e) {
          test(true, "put without user.update.* threw AuthorizationException: "+e.getMessage());
        }

        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(y).setSourceId("test").setTargetId("user.update.*").build());
        try {
          user3 = (User) dao.put(user3);
          test(true, "put with user.update.* should not throw AuthorizationException");
        } catch (AuthorizationException e) {
          test(false, "put with user.update.* should not have thrown AuthorizationException: "+e.getMessage());
        }
      `
    },
    {
      name: 'testUserSpidPermissions',
      args: [
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        DAO groupPermissionJunctionDAO = (DAO) x.get("localGroupPermissionJunctionDAO");
        groupPermissionJunctionDAO.where(EQ(GroupPermissionJunction.SOURCE_ID, "test")).removeAll();

        DAO delegate = new MDAO(User.getOwnClassInfo());
        DAO dao = new foam.nanos.auth.AuthorizationDAO.Builder(x)
          .setAuthorizer(new foam.nanos.auth.AuthorizableAuthorizer(User.class.getSimpleName().toLowerCase()))
          .setDelegate(
            new ServiceProviderAwareDAO.Builder(x)
              .setDelegate(delegate)
              .build())
          .build();

        X y = x.put("userDAO", dao);
        y = y.put("localUserDAO", dao);

        User user = null;

        User ctxUser = new User.Builder(y)
          .setId(99995)
          .setEmail("test@example.com")
          .setGroup("admin")
          .setLifecycleState(LifecycleState.ACTIVE)
          .build();
        ctxUser = (User) delegate.put(ctxUser);
        y = Auth.sudo(y, ctxUser);
        dao = dao.inX(y);

        User user1 = (User) new User.Builder(y)
          .setId(99999)
          .setFirstName("first")
          .setLastName("last")
          .setEmail("99999@test.com")
          .setGroup("test")
          .setLifecycleState(LifecycleState.ACTIVE)
          .build();

        user1 = (User) dao.put(user1);
        user1 = (User) dao.find(user1.getId());
        test(user1 != null, "find does not filter admin.");

        User user2 = (User) new User.Builder(x)
          .setId(99998)
          .setFirstName("first_two")
          .setLastName("last_two")
          .setEmail("99998@test.com")
          .setGroup("test")
          .setLifecycleState(LifecycleState.ACTIVE)
          .build();
        user2 = (User) dao.put(user2);

        User user3 = (User) new User.Builder(x)
          .setId(99993)
          .setFirstName("first_two")
          .setLastName("last_two")
          .setEmail("99998@test.com")
          .setGroup("test")
          .setSpid("other")
          .setLifecycleState(LifecycleState.ACTIVE)
          .build();
        user3 = (User) dao.put(user3);

        user = (User) dao.find(user1.getId());
        test(user != null, "find does not filter admin (2).");

        ArraySink sink = new ArraySink();
        dao.select(sink);
        List users = sink.getArray();
        test (users.size() == 4, "select does not filter admin. expected: 4, found: "+users.size());

        y = Auth.sudo(y, user1);
        dao = dao.inX(y);

        // find self
        user = (User) dao.find(user1.getId());
        test (user != null, "find self");

        // filter by user.read.id
        sink = new ArraySink();
        dao.select(sink);
        users = sink.getArray();
        test (users.size() == 1, "select same spid. expected: 1, found: "+users.size());

        // find other same spid
        try {
          user = (User) dao.find(user2.getId());
        } catch (AuthorizationException e) {
          test(true, "find without user.read.2 throws AuthorizationException: "+e.getMessage());
        }

        // find other different spid
        user = (User) dao.find(user3.getId());
        test (user == null, "find other different spid");

        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(y).setSourceId("test").setTargetId("user.read."+user2.getId()).build());

        // find other same spid
        try {
          user = (User) dao.find(user2.getId());
          test ( user != null, "find with user.read.2 finds entry.");
        } catch (AuthorizationException e) {
          test(false, "find with user.read.2 should not throw AuthorizationException: "+e.getMessage());
        }

        sink = new ArraySink();
        dao.select(sink);
        users = sink.getArray();
        test (users.size() == 2, "select with user.read.1&&2 found self and id. expected: 2, found: "+users.size());

        // create/update
        User user4 = (User) new User.Builder(x)
          .setId(88897)
          .setFirstName("four")
          .setLastName("last")
          .setEmail("four@test.com")
          .setGroup("test")
          .setSpid("other")
          .setLifecycleState(LifecycleState.ACTIVE)
          .build();

        try {
          user4 = (User) dao.put(user4);
          test(user4 == null, "put without user.create should have thrown AuthorizationException");
        } catch (AuthorizationException e) {
          test(true, "put without user.create threw AuthorizationException: "+e.getMessage());
        }

        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(y).setSourceId("test").setTargetId("user.create").build());
        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(y).setSourceId("test").setTargetId("group.update.test").build());
        try {
          user4 = (User) dao.put(user4);
          test("spid".equals(user4.getSpid()), "put without spid.create sets spid to context user");
        } catch (AuthorizationException e) {
          test(false, "put without spid.create should not throw AuthorizationException: "+e.getMessage());
        }

        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(y).setSourceId("test").setTargetId("serviceprovider.update.spid").build());
        // with ServiceProviderAwareDAO without spid.update the put returns null rather
        // than throwing the exception - not yet sure if this is the correct/expected behaviour
        // as not sure where the return of null is occuring.
        try {
          user4 = (User) user4.fclone();
          user4.setSpid("other");
          user4 = (User) dao.put(user4);
          test(user4 != null && user4.getSpid().equals("other"), "put with spid.update.*");
        } catch (AuthorizationException e) {
          test(true, "put without spid.update.target_spid threw AuthorizationException: "+e.getMessage());
        }

        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(y).setSourceId("test").setTargetId("serviceprovider.update.spid").build());
        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(y).setSourceId("test").setTargetId("serviceprovider.update.other").build());

        try {
          user4 = (User) dao.put(user4);
          test(true, "put with all permissions should not throw AuthorizationException");
        } catch (AuthorizationException e) {
          test(false, "put with all permissions should not throw AuthorizationException: "+e.getMessage());
        }

       // find other
        try {
          user = (User) dao.find(user4.getId());
          test ( user == null, "find without user.read.4 filters entry.");
        } catch (AuthorizationException e) {
          test(true, "find without user.read.4 should throw AuthorizationException: "+e.getMessage());
        }

        sink = new ArraySink();
        dao.select(sink);
        users = sink.getArray();
        test (users.size() == 2, "select with user.read.1&&2 found self and id. expected: 2, found: "+users.size());
        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(y).setSourceId("test").setTargetId("user.read.*").build());

        // should not return user 4 and user 3
        sink = new ArraySink();
        dao.select(sink);
        users = sink.getArray();
        test (users.size() == 2, "select with user.read.*. expected: 2, found: "+users.size());

        try {
          user4 = (User) user4.fclone();
          user4.setSpid("another");
          user4 = (User) dao.put(user4);
          test(false, "put without spid.update.target_spid should throw AuthorizationException");
        } catch (AuthorizationException e) {
          test(true, "put without spid.update.target_spid threw AuthorizationException: "+e.getMessage());
        }
        groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(y).setSourceId("test").setTargetId("serviceprovider.update.another").build());

        try {
          user4 = (User) dao.put(user4);
          test(user4 != null, "put with spid.update.target_spid should not throw AuthorizationException");
        } catch (AuthorizationException e) {
          test(false, "put with spid.update.target_spid should not throw AuthorizationException: "+e.getMessage());
        }

        // predicate filter by ServiceProviderAwarePredicate
        DAO where = dao.where(EQ(User.ID, user2.getId()));
        sink = new ArraySink();
        where.select(sink);
        users = sink.getArray();
        test (users.size() == 1, "ReferenceTest DAO select filtered on spid predicate and where. expected: 1, found: "+users.size());

        where = dao.where(EQ(User.ID, user3.getId()));
        sink = new ArraySink();
        where.select(sink);
        users = sink.getArray();
        test (users.size() == 0, "ReferenceTest DAO select filtered on spid predicate and where. expected: 0, found: "+users.size());

      `
    }
  ]
});
