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
    'foam.core.X',
    'foam.dao.F3FileJournal',
    'foam.dao.ReadOnlyF3FileJournal',
    'foam.dao.NullJournal'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          // TODO: These convenience constructors should be removed and done using the facade pattern.
          public JDAO(X x, foam.core.ClassInfo classInfo, String filename) {
            this(x, new foam.dao.MDAO(classInfo), filename, false);
          }

          public JDAO(X x, foam.dao.DAO delegate, String filename) {
            this(x, delegate, filename, false);
          }

          public JDAO(X x, foam.dao.DAO delegate, String filename, Boolean cluster) {
            setX(x);
            setOf(delegate.getOf());
            setDelegate(delegate);

            // create journal
            if ( cluster ) {
              setJournal(new foam.dao.NullJournal.Builder(x).build());
            } else {
              F3FileJournal journal = getFileJournal(x);
              journal.setDao(delegate);
              journal.setFilename(filename);
              journal.setCreateFile(false);
              setJournal(journal);
            }

            /* Create a composite journal of repo journal and runtime journal
              and load them all.*/
            X resourceStorageX = x;
            if ( System.getProperty("resource.journals.dir") != null ) {
              resourceStorageX = x.put(foam.nanos.fs.Storage.class,
                  new ResourceStorage(System.getProperty("resource.journals.dir")));
            }

            if ( cluster ) {
              F3FileJournal journal = getFileJournal(resourceStorageX);
              journal.setFilename(filename + ".0");
              journal.replay(x, delegate);
            } else {
              F3FileJournal journal0 = getFileJournal(resourceStorageX);
              journal0.setFilename(filename + ".0");
              F3FileJournal journal = getFileJournal(x);
              journal.setFilename(filename);

              new foam.dao.CompositeJournal.Builder(x)
                .setDelegates(new foam.dao.Journal[] {
                  journal0,
                  journal
                })
                .build()
                .replay(x, delegate);
            }
          }

          public foam.dao.F3FileJournal getFileJournal(X x) {
            if ( "ro".equals(System.getProperty("FS")) ) {
              return new foam.dao.ReadOnlyF3FileJournal.Builder(x).build();
            }
            return new foam.dao.F3FileJournal.Builder(x).build();
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
