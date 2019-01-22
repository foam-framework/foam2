/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'DeletedAwareDAOTest',
  extends: 'foam.nanos.test.Test',

  methods: [
    {
      name: 'runTest',
      javaCode: `
        DeletedAwareDAOTest_remove_DeletedAware(x);
        DeletedAwareDAOTest_remove_non_DeletedAware(x);
      `
    },
    {
      name: 'DeletedAwareDAOTest_remove_DeletedAware',
      args: [
        { of: 'foam.core.X', name: 'x' }
      ],
      javaCode: `
        foam.dao.DAO delegate = new foam.dao.MDAO(foam.nanos.auth.DeletedAwareDummy.getOwnClassInfo());
        foam.dao.DAO dao = (foam.dao.DAO) new DeletedAwareDAO.Builder(x)
          .setDelegate(delegate)
          .build();

        foam.core.FObject object = new foam.nanos.auth.DeletedAwareDummy.Builder(x)
          .setId(1)
          .setDeleted(false)
          .build();
        object = (foam.core.FObject) dao.put(object);

        dao.remove(object);
        object = (foam.core.FObject) dao.find(object.getProperty("id"));

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
        { of: 'foam.core.X', name: 'x' }
      ],
      javaCode: `
        foam.dao.DAO delegate = new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo());
        foam.dao.DAO dao = (foam.dao.DAO) new DeletedAwareDAO.Builder(x)
          .setDelegate(delegate)
          .build();

        foam.core.FObject object = new foam.nanos.auth.User.Builder(x)
          .setEmail("test@example.com")
          .build();
        object = (foam.core.FObject) dao.put(object);

        dao.remove(object);
        object = dao.find(object.getProperty("id"));

        test(object == null, "DeletedAwareDAO remove non DeletedAware object from DAO.");
      `
    }
  ]
});
