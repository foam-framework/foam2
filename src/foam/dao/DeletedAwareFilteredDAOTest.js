/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'DeletedAwareFilteredDAOTest',
  extends: 'foam.nanos.test.Test',

  methods: [
    {
      name: 'runTest',
      javaCode: `
        setUp(x);

        DeletedAwareFilteredDAOTest_find_deleted_returns_null();
        DeletedAwareFilteredDAOTest_select_do_not_include_deleted();
      `
    },
    {
      name: 'setUp',
      args: [
        { of: 'foam.core.X', name: 'x' }
      ],
      javaCode: `
        foam.dao.DAO delegate = new foam.dao.MDAO(foam.nanos.auth.DeletedAwareDummy.getOwnClassInfo());
        dao_ = (foam.dao.DAO) new DeletedAwareFilteredDAO.Builder(x)
          .setDelegate(delegate)
          .build();

        active_ = new foam.nanos.auth.DeletedAwareDummy.Builder(x)
          .setId(1)
          .setDeleted(false)
          .build();
        active_ = dao_.put(active_);

        deleted_ = new foam.nanos.auth.DeletedAwareDummy.Builder(x)
          .setId(2)
          .setDeleted(true)
          .build();
        deleted_ = dao_.put(deleted_);
      `
    },
    {
      name: 'DeletedAwareFilteredDAOTest_find_deleted_returns_null',
      javaCode: `
        foam.core.FObject found = dao_.find(active_.getProperty("id"));
        foam.core.FObject notFound = dao_.find(deleted_.getProperty("id"));

        test(found != null && notFound == null, "Find deleted entity returns null");
      `
    },
    {
      name: 'DeletedAwareFilteredDAOTest_select_do_not_include_deleted',
      javaCode: `
        foam.dao.ArraySink sink = (foam.dao.ArraySink) dao_.select(new foam.dao.ArraySink());
        java.util.List array = sink.getArray();
        foam.core.FObject found = (foam.core.FObject) array.get(0);

        test(
          array.size() == 1 && foam.util.SafetyUtil.equals(found, active_)
          , "Select does not include deleted entity"
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
          private foam.core.FObject active_;
          private foam.core.FObject deleted_;
        `);
      }
    }
  ]
});
