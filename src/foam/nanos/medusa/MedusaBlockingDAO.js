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
    'foam.core.FObject',
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
      visibility: 'RO'
    },
    {
      name: 'entries',
      class: 'Map',
      javaFactory: `return new HashMap();`,
      visibility: 'RO'
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
      name: 'find_',
      javaCode: `
      if ( id instanceof MedusaEntryId ) {
        latchOn(x, ((MedusaEntryId)id).getIndex());
        MedusaEntry entry = (MedusaEntry) waitOn(x, ((MedusaEntryId)id).getIndex());
        return (MedusaEntry) getDelegate().find_(x, entry.getId());
      }
      return (MedusaEntry) getDelegate().find_(x, id);
      `
    },
    {
      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) obj;
      latchOn(x, entry.getIndex());
      entry = (MedusaEntry) getDelegate().put_(x, entry);
      return waitOn(x, entry.getIndex());
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      if ( obj instanceof MedusaEntry ) {
        MedusaEntry entry = (MedusaEntry) obj;
        notifyOn(x, entry);
        return entry;
      }
      return getDelegate().cmd_(x, obj);
      `
    },
    {
      documentation: 'create latch, for future wait',
      name: 'latchOn',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'id',
          type: 'Long'
        }
      ],
      javaCode: `
      // TODO: this is not unique.
      synchronized ( String.valueOf(id).intern() ) {
        CountDownLatch latch = (CountDownLatch) getLatches().get(id);
        if ( latch == null ) {
          latch = new CountDownLatch(1);
          getLatches().put(id, latch);
        } else {
          getLogger().debug("latchOn", id, "latch exists");
        }
      }
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
          type: 'Long'
        }
      ],
      type: 'FObject',
      javaCode: `
      try {
        getLogger().debug("waitOn", id);
        CountDownLatch latch = (CountDownLatch) getLatches().get(id);
        if ( latch == null ) {
          getLogger().debug("waitOn", id, "Latch not found");
          return;
        }
        latch.await();
        getLogger().debug("wakeOn", id);
        return (FObject) getEntries().get(id);
      } catch (InterruptedException e) {
        // nop
        return null;
      } finally {
        getLatches().remove(id);
        getEntries().remove(id);
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
          name: 'entry',
          type: 'MedusaEntry'
        }
      ],
      javaCode: `
      Long id = entry.getIndex();
      CountDownLatch latch = (CountDownLatch) getLatches().get(id);
      if ( latch == null ) {
        ReplayingInfo info = (ReplayingInfo) x.get("replayingInfo");
        if ( ! info.getReplaying() ) {
          getLogger().debug("notifyOn", id, "Latch not found", entry.toSummary());
        }
        return;
      }
      MedusaEntry e = (MedusaEntry) getEntries().get(id);
      if ( e == null ) {
        getEntries().put(id, entry);
      }
      getLogger().debug("notifyOn", id);
      latch.countDown();
      `
    }
  ]
});
