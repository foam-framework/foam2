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
    'foam.dao.CompositeJournal',
    'foam.dao.DAO',
    'foam.dao.F3FileJournal',
    'foam.dao.MDAO',
    'foam.dao.NullJournal',
    'foam.dao.ReadOnlyF3FileJournal',
    'foam.dao.WriteOnlyF3FileJournal',
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          // TODO: These convenience constructors should be removed and done using the facade pattern.
          public JDAO(X x, foam.core.ClassInfo classInfo, String filename) {
            this(x, new MDAO(classInfo), filename, false);
          }

          public JDAO(X x, DAO delegate, String filename) {
            this(x, delegate, filename, false);
          }

          public JDAO(X x, DAO delegate, String filename, Boolean cluster) {
            setX(x);
            setOf(delegate.getOf());
            setDelegate(delegate);

            // Runtime Journal
            if ( cluster ) {
              setJournal(new NullJournal.Builder(x).build());
            } else {
              if ( "ro".equals(System.getProperty("FS")) ) {
                setJournal(new ReadOnlyF3FileJournal.Builder(x)
                  .setFilename(filename)
                  .setCreateFile(true)
                  .setDao(delegate)
                  .build());
              } else {
                setJournal(new F3FileJournal.Builder(x)
                  .setDao(delegate)
                  .setFilename(filename)
                  .setCreateFile(false)
                  .build());
              }
            }

            /* Create a composite journal of repo journal and runtime journal
              and load them all.*/
            X resourceStorageX = x;
            if ( System.getProperty("resource.journals.dir") != null ) {
              resourceStorageX = x.put(foam.nanos.fs.Storage.class,
                  new ResourceStorage(System.getProperty("resource.journals.dir")));
            }

            // Repo Journal
            F3FileJournal journal0 = new ReadOnlyF3FileJournal.Builder(resourceStorageX)
              .setFilename(filename + ".0")
              .build();

            new CompositeJournal.Builder(resourceStorageX)
              .setDelegates(new foam.dao.Journal[] {
                journal0,
                getJournal()
              })
              .build()
              .replay(resourceStorageX, delegate);
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
