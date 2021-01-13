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

  javaImports: [
    'foam.nanos.fs.ResourceStorage',
    'foam.core.X'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          // TODO: These convenience constructors should be removed and done using the facade pattern.
          public JDAO(X x, foam.core.ClassInfo classInfo, String filename) {
            this(x, new foam.dao.MDAO(classInfo), filename);
          }

          public JDAO(X x, foam.dao.DAO delegate, String filename) {
            setX(x);
            setOf(delegate.getOf());
            setDelegate(delegate);

            // create journal
            setJournal(new foam.dao.F3FileJournal.Builder(x)
              .setDao(delegate)
              .setFilename(filename)
              .setCreateFile(true)
              .build());

            /* Create a composite journal of repo journal and runtime journal
              and load them all.*/
            X resourceStorageX = x;
            if ( System.getProperty("resource.journals.dir") != null ) {
              resourceStorageX = x.put(foam.nanos.fs.Storage.class,
                  new ResourceStorage(System.getProperty("resource.journals.dir")));
            }

            new foam.dao.CompositeJournal.Builder(x)
              .setDelegates(new foam.dao.Journal[] {
                new foam.dao.F3FileJournal.Builder(resourceStorageX)
                  .setFilename(filename + ".0")
                  .build(),
                new foam.dao.F3FileJournal.Builder(x)
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
      javaCode: `
        return getJournal().put(x, "", getDelegate(), obj);
      `
    },
    {
      name: 'remove_',
      javaCode: `
        return getJournal().remove(x, "", getDelegate(), obj);
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
