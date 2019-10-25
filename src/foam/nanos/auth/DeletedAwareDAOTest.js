/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'DeletedAwareDAOTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.X',
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.util.Auth',
    'java.util.List',
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        DeletedAwareDAOTest_remove_DeletedAware(x);
        DeletedAwareDAOTest_remove_non_DeletedAware(x);
        DeletedAwareDAOTest_removeAll(x);

        User user = new User.Builder(x)
          .setEmail("test@example.com")
          .build();
        X y = Auth.sudo(x, user);

        // Swtich to context that has no model.read.deleted permission
        DeletedAwareDAOTest_find_deleted_object_returns_null(y);
        DeletedAwareDAOTest_select_does_not_include_deleted_objects(y);
      `
    },
    {
      name: 'DeletedAwareDAOTest_remove_DeletedAware',
      args: [
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
        DAO delegate = new MDAO(DeletedAwareDummy.getOwnClassInfo());
        DAO dao = (DAO) new DeletedAwareDAO.Builder(x).setDelegate(delegate).build();

        FObject object = new DeletedAwareDummy.Builder(x)
          .setId(1)
          .setDeleted(false)
          .build();
        object = dao.put(object);

        dao.remove(object);

        object = dao.inX(x).find(object.getProperty("id"));

        test(object != null, "DeletedAwareDAO does not remove DeletedAware object from DAO.");
        test(
          ((DeletedAware) object).getDeleted(),
          "DeletedAwareDAO set DeletedAware.deleted=true on remove."
        );
      `
    },
    {
      name: 'DeletedAwareDAOTest_remove_non_DeletedAware',
      args: [
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
        DAO delegate = new MDAO(Country.getOwnClassInfo());
        DAO dao = (DAO) new DeletedAwareDAO.Builder(x).setDelegate(delegate).build();

        FObject object = new Country.Builder(x)
          .setCode("CA")
          .build();
        object = dao.put(object);

        dao.remove(object);
        object = dao.find(object.getProperty("code"));

        test(object == null, "DeletedAwareDAO remove non DeletedAware object from DAO.");
      `
    },
    {
      name: 'DeletedAwareDAOTest_removeAll',
      args: [
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
        DAO delegate = new MDAO(DeletedAwareDummy.getOwnClassInfo());
        DAO dao = (DAO) new DeletedAwareDAO.Builder(x).setDelegate(delegate).build();

        dao.put(
          new DeletedAwareDummy.Builder(x)
            .setId(1)
            .setDeleted(false)
            .build()
        );

        dao.removeAll();
        ArraySink sink = (ArraySink) dao.select(new ArraySink());
        List array = sink.getArray();

        test(array.size() == 1
          && ((DeletedAware) array.get(0)).getDeleted()
          , "DeletedAwareDAO set DeletedAware.deleted=true on removeAll."
        );
      `
    },
    {
      name: 'DeletedAwareDAOTest_find_deleted_object_returns_null',
      args: [
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
        DAO delegate = new MDAO(DeletedAwareDummy.getOwnClassInfo());
        DAO dao = (DAO) new DeletedAwareDAO.Builder(x).setDelegate(delegate).build();

        FObject object = new DeletedAwareDummy.Builder(x)
          .setId(1)
          .setDeleted(false)
          .build();
        object = dao.put(object);

        dao.inX(x).remove(object);
        object = dao.inX(x).find(object.getProperty("id"));

        test(object == null, "DeletedAwareDAO.find deleted object returns null.");
      `
    },
    {
      name: 'DeletedAwareDAOTest_select_does_not_include_deleted_objects',
      args: [
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
        DAO delegate = new MDAO(DeletedAwareDummy.getOwnClassInfo());
        DAO dao = (DAO) new DeletedAwareDAO.Builder(x).setDelegate(delegate).build();

        FObject object = new DeletedAwareDummy.Builder(x)
          .setId(1)
          .setDeleted(false)
          .build();
        object = dao.put(object);

        FObject deleted = new DeletedAwareDummy.Builder(x)
          .setId(2)
          .setDeleted(true)
          .build();
        deleted = dao.put(deleted);

        ArraySink sink = (ArraySink) dao.inX(x).select(new ArraySink());
        List array = sink.getArray();

        test(
          array.contains(object) && ! array.contains(deleted)
          , "DeletedAwareDAO.select does not include deleted objects."
        );
      `
    }
  ]
});
