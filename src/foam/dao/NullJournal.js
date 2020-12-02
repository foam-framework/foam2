/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'NullJournal',
  extends: 'foam.dao.AbstractF3FileJournal',
  flags: ['java'],

  documentation: `Perform CRUD operations on delegate dao, and NOPs to file system.`,
  
  implements: [
    'foam.dao.Journal'
  ],

  javaImports: [
    'foam.core.FObject',
  ],

  methods: [
    {
      name: 'put',
      type: 'FObject',
      args: [ 'Context x', 'String prefix', 'DAO dao', 'foam.core.FObject obj' ],
      javaCode: `
        final Object               id  = obj.getProperty("id");

        getLine().enqueue(new foam.util.concurrent.AbstractAssembly() {
          public Object[] requestLocks() {
            return new Object[] { id };
          }

          public void executeUnderLock() {
            dao.put_(x, obj);
          }
        });

        return obj;
      `
    },
    {
      name: 'remove',
      type: 'FObject',
      args: [ 'Context x', 'String prefix', 'DAO dao', 'foam.core.FObject obj' ],
      javaCode: `
      final Object id = obj.getProperty("id");

      getLine().enqueue(new foam.util.concurrent.AbstractAssembly() {

        public Object[] requestLocks() {
          return new Object[] { id };
        }

        public void executeUnderLock() {
          dao.remove_(x, obj);
        }
      });

      return obj;
      `
    },
    {
      name: 'replay',
      documentation: 'nop',
      args: [
        { name: 'x',   type: 'Context' },
        { name: 'dao', type: 'foam.dao.DAO' }
      ],
      javaCode: `
        // nop
      `
    }
  ]
});
