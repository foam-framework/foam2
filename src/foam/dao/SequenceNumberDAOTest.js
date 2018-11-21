/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'SequenceNumberDAOTest',
  extends: 'foam.nanos.test.Test',

  methods: [
    {
      name: 'runTest',
      javaCode: `
        foam.dao.DAO delegate = new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo());
        foam.dao.SequenceNumberDAO seq = new SequenceNumberDAO(delegate);

        // test using default value
        foam.core.FObject user = new foam.nanos.auth.User.Builder(x).setFirstName("Test").build();
        test(seq.getValue_() == 1, "Sequence number value equals 1 before putting to DAO.");
        user = seq.put(user);

        test(foam.util.SafetyUtil.equals(user.getProperty("id"), 1), "User id equals 1");
        test(seq.getValue_() == 2, "Sequence number value equals 2 after putting to DAO.");

        // test using starting value of 1000
        user = new foam.nanos.auth.User.Builder(x).setFirstName("Test").build();
        delegate = new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo());
        seq = new SequenceNumberDAO(1000, delegate);

        test(seq.getValue_() == 1000, "Sequence number value equals 1 before putting to DAO.");
        user = seq.put(user);

        test(foam.util.SafetyUtil.equals(user.getProperty("id"), 1000), "User id equals 1000");
        test(seq.getValue_() == 1001, "Sequence number value equals 1001 after putting to DAO.");

        // test sequence number getting delegate max
        user = new foam.nanos.auth.User.Builder(x).setId(5000).setFirstName("Test").build();
        delegate = new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo());
        delegate.put(user);

        seq = new SequenceNumberDAO(delegate);
        test(seq.getValue_() == 5001, "Sequence number value equals 5001 after initializing.");
      `
    }
  ]
});
