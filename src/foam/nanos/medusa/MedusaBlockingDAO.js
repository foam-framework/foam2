/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaBlockingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Wait for consensus on MedusaEntry before returning from put(). See MedusaEntryRoutingDAO for notification.',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.util.concurrent.CountDownLatch',
    'java.util.concurrent.ThreadLocalRandom',
    'java.util.HashMap',
    'java.util.Map',
    'java.util.Random',
    'java.util.UUID'
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
      MedusaEntry entry = (MedusaEntry) obj;
      if ( SafetyUtil.isEmpty(entry.getBlockingId()) ) {
        java.util.Random r = ThreadLocalRandom.current();
        entry.setBlockingId(new UUID(r.nextLong(), r.nextLong()).toString());
      }
      entry = (MedusaEntry) getDelegate().put_(x, entry);
      waitOn(x, entry.getBlockingId());
      return entry;
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      if ( obj instanceof MedusaEntry ) {
        MedusaEntry entry = (MedusaEntry) obj;
        notifyOn(x, entry.getBlockingId());
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
          name: 'id',
          type: 'String'
        }
      ],
      javaCode: `
      CountDownLatch latch = null;

      synchronized ( String.valueOf(id).intern() ) {
        latch = (CountDownLatch) getLatches().get(id);
        if ( latch == null ) {
          latch = new CountDownLatch(1);
          getLatches().put(id, latch);
        }
      }

      try {
        getLogger().debug("waitOn", id);
        latch.await();
        getLogger().debug("wakeOn", id);
      } catch (InterruptedException e) {
        // nop
      } finally {
        getLatches().remove(id);
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
          name: 'id',
          type: 'String'
        }
      ],
      javaCode: `
      CountDownLatch latch = null;

      synchronized ( String.valueOf(id).intern() ) {
        latch = (CountDownLatch) getLatches().get(id);
        if ( latch == null ) {
          latch = new CountDownLatch(0);
          getLatches().put(id, latch);
        }
      }
      getLogger().debug("notifyOn", id);
      latch.countDown();
      `
    }
  ]
});
