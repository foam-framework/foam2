/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao.java',
  name: 'JDAO',
  extends: 'foam.dao.ProxyDAO',
  flags: ['java'],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          // TODO: These convenience constructors should be removed and done using the facade pattern.
          public JDAO(foam.core.X x, foam.core.ClassInfo classInfo, String filename) {
            this(x, new foam.dao.MDAO(classInfo), filename);
          }

          public JDAO(foam.core.X x, foam.dao.DAO delegate, String filename) {
            setX(x);
            setOf(delegate.getOf());
            setDelegate(delegate);

            // create journal
            setJournal(new foam.dao.FileJournal.Builder(x)
              .setDao(delegate)
              .setFilename(filename)
              .setCreateFile(true)
              .build());

            // create a composite journal of repo journal
            // and runtime journal and load them all
            new foam.dao.CompositeJournal.Builder(x)
              .setDelegates(new foam.dao.Journal[]{
                new foam.dao.FileJournal.Builder(x)
                  .setFilename(filename + ".0")
                  .build(),
                new foam.dao.FileJournal.Builder(x)
                  .setFilename(filename)
                  .build()
              })
              .build().replay(x, delegate);
          }
        `);
      }
    }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.dao.Journal',
      name: 'journal'
    }
  ],

  methods: [
    {
      name: 'put_',
      synchronized: true,
      javaCode: `
        foam.core.FObject old = super.find_(x, obj.getProperty("id"));
        foam.core.FObject result = super.put_(x, obj);
        getJournal().put_(x, old, result);
        return result;
      `
    },
    {
      name: 'remove_',
      synchronized: true,
      javaCode: `
        foam.core.FObject result = super.remove_(x, obj);
        getJournal().remove(x, result);
        return result;
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
        super.select_(x, new foam.dao.RemoveSink(x, this), skip, limit, order, predicate);
      `
    }
  ]
});
