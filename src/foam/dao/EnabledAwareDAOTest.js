/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'EnabledAwareDAOTest',
  extends: 'foam.nanos.test.Test',

  methods: [
    {
      name: 'runTest',
      javaCode: `
        setUp(x);

        EnabledAwareDAOTest_find_disabled_returns_null();
        EnabledAwareDAOTest_select_do_not_include_disabled();
      `
    },
    {
      name: 'setUp',
      args: [
        { of: 'foam.core.X', name: 'x' }
      ],
      javaCode: `
      foam.dao.DAO delegate = new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo());
        dao_ = (foam.dao.DAO) new EnabledAwareDAO.Builder(x)
          .setDelegate(delegate).build();

        enabled_ = new foam.nanos.auth.User.Builder(x)
          .setId(1).setEnabled(true).build();
        enabled_ = dao_.put(enabled_);

        disabled_ = new foam.nanos.auth.User.Builder(x)
          .setId(2).setEnabled(false).build();
        disabled_ = dao_.put(disabled_);
      `
    },
    {
      name: 'EnabledAwareDAOTest_find_disabled_returns_null',
      javaCode: `
        foam.core.FObject found = dao_.find(enabled_.getProperty("id"));
        foam.core.FObject notFound = dao_.find(disabled_.getProperty("id"));

        test(found != null && notFound == null, "Find disabled entity returns null");
      `
    },
    {
      name: 'EnabledAwareDAOTest_select_do_not_include_disabled',
      javaCode: `
        foam.dao.ArraySink sink = (foam.dao.ArraySink) dao_.select(new foam.dao.ArraySink());
        java.util.List array = sink.getArray();
        foam.core.FObject found = (foam.core.FObject) array.get(0);

        test(
          array.size() == 1 && foam.util.SafetyUtil.equals(found, enabled_)
          , "Select does not include disabled entity"
        );
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          private foam.core.X x_;
          private foam.dao.DAO dao_;
          private foam.core.FObject enabled_;
          private foam.core.FObject disabled_;
        `);
      }
    }
  ]
});
