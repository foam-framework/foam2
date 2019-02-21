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
      value: `userDAO.p({"class":"foam.nanos.auth.User","id":1000,"firstName":"Kirk","lastName":"Eaton"})`
    },
    {
      type: 'String',
      name: 'GROUP_DAO_PUT',
      documentation: 'GroupDAO expected put line',
      value: `groupDAO.p({"class":"foam.nanos.auth.Group","id":"admin","enabled":true})`

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
        
        foam.dao.SharedJournalConfig config = new foam.dao.SharedJournalConfig.Builder(x).
          setFile(file).
          setFilename("doesnt-matter").
          build();

        // Create new DAOs that should load from a shared journal
        foam.dao.DAO replayTarget = new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo());
        foam.dao.Journal journal = config.makeFileJournal("users");
        
        foam.dao.DAO userDAO = new foam.dao.java.JDAO.Builder(x)
          .setOf(foam.nanos.auth.User.getOwnClassInfo())
          .setDelegate(replayTarget)
          .setJournal(journal)
          .build();
          
        journal.replay(x, replayTarget);

        replayTarget = new foam.dao.MDAO(foam.nanos.auth.Group.getOwnClassInfo());

        journal = config.makeFileJournal("groups");
        
        foam.dao.DAO groupDAO = new foam.dao.java.JDAO.Builder(x)
          .setOf(foam.nanos.auth.Group.getOwnClassInfo())
          .setDelegate(replayTarget)
          .setJournal(journal)
          .build();

        // Replay shouldn't actually do anything as journal is empty.
        journal.replay(x, replayTarget);



        userDAO.put(new foam.nanos.auth.User.Builder(x).setId(1000).setFirstName("Kirk").setLastName("Eaton").build());
        groupDAO.put(new foam.nanos.auth.Group.Builder(x).setId("admin").setEnabled(true).build());
        
        // verify userdao after put
        VerifyUserDAO(userDAO);
        // verify groupdao after put
        VerifyGroupDAO(groupDAO);

        // Create new DAOs that should load from the journals.
        replayTarget = new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo());
        journal = config.makeFileJournal("users");
        
        userDAO = new foam.dao.java.JDAO.Builder(x)
          .setOf(foam.nanos.auth.User.getOwnClassInfo())
          .setDelegate(replayTarget)
          .setJournal(journal)
          .build();
          
        journal.replay(x, replayTarget);

        replayTarget = new foam.dao.MDAO(foam.nanos.auth.Group.getOwnClassInfo());

        journal = config.makeFileJournal("groups");
        
        groupDAO = new foam.dao.java.JDAO.Builder(x)
          .setOf(foam.nanos.auth.Group.getOwnClassInfo())
          .setDelegate(replayTarget)
          .setJournal(journal)
          .build();

        journal.replay(x, replayTarget);

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
