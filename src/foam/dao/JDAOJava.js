/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'JDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.ClassInfo',
    'foam.core.FObject',
    'foam.core.X',
    'foam.nanos.auth.LastModifiedByAware',
    'java.text.SimpleDateFormat',
    'java.util.Calendar',
    'java.util.TimeZone'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          protected static ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
            @Override
            protected StringBuilder initialValue() {
              return new StringBuilder();
            }

            @Override
            public StringBuilder get() {
              StringBuilder b = super.get();
              b.setLength(0);
              return b;
            }
          };

          protected static final ThreadLocal<SimpleDateFormat> sdf = new ThreadLocal<SimpleDateFormat>() {
            @Override
            protected SimpleDateFormat initialValue() {
              SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
              sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
              return sdf;
            }
          };


          // TODO: These convenience constructors should be removed and done using the facade pattern.
          public JDAO(X x, ClassInfo classInfo, String filename) {
            this(x, new MapDAO(classInfo), filename);
          }

          public JDAO(X x, DAO delegate, String filename) {
            setX(x);
            setOf(delegate.getOf());
            setDelegate(delegate);

            // create journal
            journal_ = new FileJournal.Builder(getX())
              .setDao(delegate)
              .setFilename(filename)
              .setCreateFile(true)
              .build();

            // create a composite journal of repo journal
            // and runtime journal and load them all
            new CompositeJournal.Builder(getX())
              .setDelegates(new Journal[]{
                new FileJournal.Builder(getX())
                  .setFilename(filename + ".0")
                  .build(),
                new FileJournal.Builder(getX())
                  .setFilename(filename)
                  .build()
              })
              .build().replay(delegate);
          }
        `);
      }
    }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.dao.FileJournal',
      name: 'journal'
    }
  ],

  methods: [
    {
      name: 'put_',
      synchronized: true,
      javaCode: `
      //TODO: since this shouldn't be happening.
      try {
        if ( ! ( obj instanceof LastModifiedByAware ) || ((LastModifiedByAware) obj).getLastModifiedBy() == 0L ) {
          writeComment((foam.nanos.auth.User) x.get("user"));
        }
      } catch (Throwable t) {
        t.printStackTrace();
      }
      journal_.put(obj, null);
      return super.put_(x, obj);
      `
    },
    {
      name: 'remove_',
      synchronized: true,
      javaCode: `
      //TODO: since this shouldn't be happening.
      try {
        if ( ! ( obj instanceof LastModifiedByAware ) || ((LastModifiedByAware) obj).getLastModifiedBy() == 0L ) {
          writeComment((foam.nanos.auth.User) x.get("user"));
        }
      } catch (Throwable t) {
        t.printStackTrace();
      }
      journal_.remove(obj, null);
      return super.remove_(x, obj);
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
        getDelegate().select_(x, new RemoveSink(x, this), skip, limit, order, predicate);
      `
    },
    {
      name: 'writeComment',
      synchronized: true,
      documentation: 'Writes comment explaining who modified entry',
      args: [
        {
          class: 'FObjectProperty',
          of: 'foam.nanos.auth.User',
          name: 'user'
        }
      ],
      javaCode: `
        journal_.write_(sb.get()
          .append("// Modified by ")
          .append(user.label())
          .append(" (")
          .append(user.getId())
          .append(") at ")
          .append(sdf.get().format(Calendar.getInstance().getTime()))
          .toString());
      `
    }
  ]
});
