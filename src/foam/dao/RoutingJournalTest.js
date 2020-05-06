/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'RoutingJournalTest',
  extends: 'foam.nanos.test.Test',
  flags: ['java'],

  documentation: '',

  constants: [
    {
      type: 'String',
      name: 'USER_DAO_PUT',
      documentation: 'UserDAO expected put line',
      value: `userDAO.p({"class":"foam.nanos.auth.User","id":1000,"firstName":"Kirk","lastName":"Eaton"`
    },
    {
      type: 'String',
      name: 'GROUP_DAO_PUT',
      documentation: 'GroupDAO expected put line',
      value: `groupDAO.p({"class":"foam.nanos.auth.Group","id":"admin","enabled":true`

    }
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        java.io.File file = null;
        try {
          file = java.io.File.createTempFile("journal", "tmp");
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }

        foam.dao.DAO userDAODelegate = new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo());
        foam.dao.DAO groupDAODelegate = new foam.dao.MDAO(foam.nanos.auth.Group.getOwnClassInfo());

        x = x.put("userDAO", userDAODelegate);
        x = x.put("groupDAO", groupDAODelegate);
        x = x.put(foam.nanos.fs.Storage.class, new foam.nanos.fs.FileSystemStorage(file.getParent()));

        foam.dao.RoutingJournal journal = new foam.dao.RoutingJournal.Builder(x).setFilename(file.getName()).build();
        foam.dao.DAO userDAO = new foam.dao.RoutingJDAO.Builder(x)
          .setService("userDAO")
          .setOf(foam.nanos.auth.User.getOwnClassInfo())
          .setDelegate(userDAODelegate)
          .setJournal(journal)
          .build();

        foam.dao.DAO groupDAO = new foam.dao.RoutingJDAO.Builder(x)
          .setService("groupDAO")
          .setOf(foam.nanos.auth.Group.getOwnClassInfo())
          .setDelegate(groupDAODelegate)
          .setJournal(journal)
          .build();

        // Hack!
        journal.setReplayed(true);

        userDAO.put(new foam.nanos.auth.User.Builder(x).setId(1000).setFirstName("Kirk").setLastName("Eaton").build());
        groupDAO.put(new foam.nanos.auth.Group.Builder(x).setId("admin").setEnabled(true).build());

        // check to see that lines are correctly output
        try ( java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.FileReader(file)) ) {
          boolean userMatch = true;
          boolean groupMatch = true;
          for ( String line ; ( line = reader.readLine() ) != null ; ) {
            if ( foam.util.SafetyUtil.isEmpty(line) ) continue;
            userMatch = line.startsWith(USER_DAO_PUT);
            groupMatch = line.startsWith(GROUP_DAO_PUT);
            test(userMatch || groupMatch, "RoutingJournal correctly outputs expected lines. User Match: " + userMatch + ", Group Match: " + groupMatch);
          }
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }

        // verify userdao after put
        VerifyUserDAO(userDAO);
        // verify groupdao after put
        VerifyGroupDAO(groupDAO);

        // empty daos
        userDAODelegate.removeAll();
        groupDAODelegate.removeAll();

        foam.mlang.sink.Count count = new foam.mlang.sink.Count();
        count = (foam.mlang.sink.Count) userDAO.select(count);
        test(count.getValue() == 0, "UserDAO is empty");

        count = new foam.mlang.sink.Count();
        count = (foam.mlang.sink.Count) groupDAO.select(count);
        test(count.getValue() == 0, "GroupDAO is empty");

        journal.replay(x, new foam.dao.NullDAO());

        // verify userDAO after replay
        VerifyUserDAO(userDAO);
        // verify groupDAO after replay
        VerifyGroupDAO(groupDAO);
      `
    },
    {
      name: 'VerifyUserDAO',
      args: [
        { name: 'userDAO', type: 'foam.dao.DAO' }
      ],
      javaCode: `
        // select from userDAO
        foam.dao.Sink sink = userDAO.select(new foam.dao.ArraySink());
        java.util.List array = ((foam.dao.ArraySink) sink).getArray();

        // verify length & contents of userDAO
        test(array.size() == 1, "UserDAO should contain one element");
        foam.nanos.auth.User user = (foam.nanos.auth.User) array.get(0);
        test(user != null, "User is not null");
        test(user.getId() == 1000L, "User's id is 1000");
        test("Kirk".equals(user.getFirstName()), "User's first name is \\"Kirk\\"");
        test("Eaton".equals(user.getLastName()), "User's first name is \\"Eaton\\"");
      `
    },
    {
      name: 'VerifyGroupDAO',
      args: [
        { name: 'groupDAO', type: 'foam.dao.DAO' }
      ],
      javaCode: `
        // select from groupDAO
        foam.dao.Sink sink = groupDAO.select(new foam.dao.ArraySink());
        java.util.List array = ((foam.dao.ArraySink) sink).getArray();

        // verify length & contents of groupDAO
        test(array.size() == 1, "GroupDAO should contain one element");
        foam.nanos.auth.Group group = (foam.nanos.auth.Group) array.get(0);
        test(group != null, "Group is not null");
        test("admin".equals(group.getId()), "Group's id is \\"admin\\"");
        test(group.getEnabled(), "Group is enabled");
      `
    }
  ]
});
