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
      CountDownLatch latch = null;
      // TODO: this is not unique.
      synchronized ( String.valueOf(id).intern() ) {
        latch = (CountDownLatch) getLatches().get(id);
        if ( latch == null ) {
          latch = new CountDownLatch(1);
          getLatches().put(id, latch);
        } else {
          getLogger().warning("waitOn", id, "latch exists");
        }
      }

      try {
        getLogger().debug("waitOn", id);
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
      CountDownLatch latch = null;
      Long id = entry.getIndex();
      synchronized ( String.valueOf(id).intern() ) {
        latch = (CountDownLatch) getLatches().get(id);
        if ( latch == null ) {
          // TODO/REVIEW - that these are removed/cleaned up.
          getLogger().warning("notifyOn", id, "Latch not found", entry.toSummary());
          return;
        }
        MedusaEntry e = (MedusaEntry) getEntries().get(id);
        if ( e == null ) {
          getEntries().put(id, entry);
        }
      }
      getLogger().debug("notifyOn", id);
      latch.countDown();
      `
    }
  ]
});
