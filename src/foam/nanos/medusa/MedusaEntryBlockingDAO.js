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
      javaFactory: `return new HashMap();`,
      visibility: 'HIDDEN'
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    },
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) getDelegate().put_(x, obj);
      waitOn(x, entry.getIndex());
      return entry;
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      if ( obj instanceof MedusaEntry ) {
        MedusaEntry entry = (MedusaEntry) obj;
        notifyOn(x, entry.getIndex());
        return entry;
      }
      return getDelegate().cmd_(x, obj);
      `
    },
    {
      name: 'waitOn',
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
        getLogger().debug("waitOn", index);
        latch.await();
        getLogger().debug("wakeOn", index);
      } catch (InterruptedException e) {
        // nop
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
      getLogger().debug("notifyOn", index);
      latch.countDown();
      `
    }
  ]
});
