/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'EnabledAwareDAOTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.nanos.auth.EnabledAwareDummy',
    'java.util.List',
  ],

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
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
        DAO delegate = new foam.dao.MDAO(EnabledAwareDummy.getOwnClassInfo());
        dao_ = (DAO) new EnabledAwareDAO.Builder(x)
          .setDelegate(delegate)
          .build();

        enabled_ = new EnabledAwareDummy.Builder(x)
          .setId(1)
          .setEnabled(true)
          .build();
        enabled_ = dao_.put(enabled_);

        disabled_ = new EnabledAwareDummy.Builder(x)
          .setId(2)
          .setEnabled(false)
          .build();
        disabled_ = dao_.put(disabled_);
      `
    },
    {
      name: 'EnabledAwareDAOTest_find_disabled_returns_null',
      javaCode: `
        FObject found = dao_.find(enabled_.getProperty("id"));
        FObject notFound = dao_.find(disabled_.getProperty("id"));

        test(found != null && notFound == null, "Find disabled entity returns null");
      `
    },
    {
      name: 'EnabledAwareDAOTest_select_do_not_include_disabled',
      javaCode: `
        ArraySink sink = (ArraySink) dao_.select(new ArraySink());
        List array = sink.getArray();

        test(
          array.contains(enabled_) && ! array.contains(disabled_)
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
          private DAO dao_;
          private FObject enabled_;
          private FObject disabled_;
        `);
      }
    }
  ]
});
