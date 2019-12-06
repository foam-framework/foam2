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
    'foam.core.X',
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.ProxySink',
    'foam.dao.Sink',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.nanos.auth.User',
    'foam.util.Auth',
    'foam.util.SafetyUtil',
    'foam.nanos.auth.ServiceProviderAware',
    'foam.nanos.auth.ServiceProviderAwareDAO',
    'foam.nanos.auth.ServiceProviderAwareSink',
    'java.util.List',
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        User user = new User.Builder(x)
          .setId(99995)
          .setEmail("test@example.com")
          .setSpid("test")
          .setGroup("admin")
          .build();
        X y = Auth.sudo(x, user);

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
        User ctxUser = (User) x.get("user");
        DAO delegate = new MDAO(User.getOwnClassInfo());
        DAO dao = (DAO) new ServiceProviderAwareDAO.Builder(x).setDelegate(delegate).build();
        ctxUser = (User) delegate.put_(x, ctxUser);
        int idx = 0;

        test("test".equals(ctxUser.getSpid()), "["+(idx++)+"] context user spid is set");
        User user = (User) new User.Builder(x)
          .setId(99999)
          .build();
        test(foam.util.SafetyUtil.isEmpty(user.getSpid()), "["+(idx++)+"] user spid initially empty/null.");
        user = (User) dao.put(user);

        test(ctxUser.getSpid().equals(user.getSpid()), "["+(idx++)+"] ServiceProviderAwareDAO put sets spid. ");
        user = (User) dao.find(user.getId());
        test(user != null, "["+(idx++)+"] ServiceProviderAwareDAO find matches spid.");

        User user2 = (User) new User.Builder(x)
          .setId(99998)
          .build();
        dao.put(user2);

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
          .build();
        dao.put(user3);

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
        User ctxUser = (User) x.get("user");
        DAO delegate = new MDAO(User.getOwnClassInfo());
        DAO dao = (DAO) new ServiceProviderAwareDAO.Builder(x).setDelegate(delegate).build();
//        ctxUser = (User) delegate.put_(x, ctxUser);
        int idx = 0;
     `
    }
  ]
});
