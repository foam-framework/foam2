/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'WriteOnlyF3FileJournal',
  extends: 'foam.dao.F3FileJournal',

  javaImports: [
    'foam.core.ClassInfo',
    'foam.core.FObject',
    'foam.lib.formatter.JSONFObjectFormatter',
    'foam.util.concurrent.AbstractAssembly',
    'foam.util.SafetyUtil'
  ],

  methods: [
    {
      name: 'replay',
      javaCode: `
        return;
      `
    },
    {
      name: 'put',
      type: 'FObject',
      args: [ 'Context x', 'String prefix', 'DAO dao', 'foam.core.FObject obj' ],
      javaCode: `
        final Object                 id  = obj.getProperty("id");
        final ClassInfo              of  = dao.getOf();
        final JSONFObjectFormatter fmt = formatter.get();

        getLine().enqueue(new foam.util.concurrent.AbstractAssembly() {
          FObject old;

          public Object[] requestLocks() {
            return new Object[] { id };
          }

          public void executeUnderLock() {
            dao.put_(x, obj);
          }

          public void executeJob() {
            try {
              fmt.output(obj, of);
            } catch (Throwable t) {
              getLogger().error("Failed to format journal entry", t);
              fmt.reset();
            }
          }

          public void endJob(boolean isLast) {
            if ( fmt.builder().length() == 0 ) return;

            try {
              writePut_(
                x,
                fmt.builder(),
                getMultiLineOutput() ? "\\n" : "",
                SafetyUtil.isEmpty(prefix) ? "" : prefix + ".");

              if ( isLast ) getWriter().flush();
            } catch (Throwable t) {
              getLogger().error("Failed to write put entry to journal", t);
            }
          }
        });

        return obj;
      `
    },
  ]
});
