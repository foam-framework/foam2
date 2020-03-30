/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntryBlockingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Wait for consensus on MedusaEntry before returning from put(). See MedusaEntryRoutingDAO for notification.',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.util.concurrent.CountDownLatch',
    'java.util.HashMap',
    'java.util.Map'
  ],

  properties: [
    {
      name: 'latches',
      class: 'Map',
      javaFactory: `return new HashMap();`
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
        Logger logger = (Logger) getX().get("logger");
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, logger);
      `
    },
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) getDelegate().put_(x, obj);
      getLogger().debug("waitOn", entry.getIndex());
      waitOn(x, entry.getIndex());
      return entry;
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      if ( obj instanceof MedusaEntry ) {
        MedusaEntry entry = (MedusaEntry) obj;
        getLogger().debug("notifyOn", entry.getIndex());
        notifyOn(x, entry.getIndex());
        return entry;
      }
      return getDelegate().cmd_(x, obj);
      `
    },
    {
      name: 'waitOn',
      synchronized: true, // TODO: if string then intern
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'index',
          type: 'Long'
        }
      ],
      javaCode: `
      CountDownLatch latch = null;

      synchronized ( String.valueOf(index).intern() ) {
        latch = (CountDownLatch) getLatches().get(index);
        if ( latch == null ) {
          latch = new CountDownLatch(1);
          getLatches().put(index, latch);
        }
      }

      try {
        latch.await();
        getLogger().debug("wakeOn", index);
      } catch (InterruptedException e) {
        ((Logger) x.get("logger")).warning(this.getClass().getSimpleName(), "latch", index, "await", e.getMessage());
      } finally {
        getLatches().remove(index);
      }
      `
    },
    {
      name: 'notifyOn',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'index',
          type: 'Long'
        }
      ],
      javaCode: `
      CountDownLatch latch = null;

      synchronized ( String.valueOf(index).intern() ) {
        latch = (CountDownLatch) getLatches().get(index);
        if ( latch == null ) {
          latch = new CountDownLatch(0);
          getLatches().put(index, latch);
        }
      }

      latch.countDown();
      `
    }
  ]
});
