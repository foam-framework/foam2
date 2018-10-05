foam.CLASS({
  package: 'foam.dao.index',
  name: 'PersistedIndexTest',
  extends: 'foam.nanos.test.Test',

  methods: [
    {
      name: 'runTest',
      javaCode: `
        try {
          foam.dao.index.TreeIndex index = new foam.dao.index.TreeIndex(foam.nanos.auth.Country.CODE);
          foam.dao.index.PersistedIndex pindex = new foam.dao.index.PersistedIndex("testindex", index);

          foam.dao.index.PersistedState w1 = (foam.dao.index.PersistedState) pindex.wrap("hello world");
          pindex.flush(w1);
          test(w1.getPosition() == 0, "position is 0");
          test("hello world".equals(pindex.unwrap(w1)), "state is hello world");

          foam.dao.index.PersistedState w2 = (foam.dao.index.PersistedState) pindex.wrap("test123");
          pindex.flush(w2);
          test(w2.getPosition() == 18, "position is 18");
          test("test123".equals(pindex.unwrap(w2)), "state is test123");
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    }
  ]
});
