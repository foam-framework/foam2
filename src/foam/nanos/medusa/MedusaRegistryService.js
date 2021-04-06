/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaRegistryService',

  implements: [
    'foam.core.ContextAware',
    'foam.nanos.medusa.MedusaRegistry'
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'java.util.ArrayList',
    'java.util.concurrent.CountDownLatch',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map'
  ],

  properties: [
    {
      name: 'medusaEntryDAO',
      class: 'FObjectProperty',
      of: 'foam.dao.DAO',
      javaFactory: 'return (foam.dao.DAO) getX().get("internalMedusaDAO");',
      visibility: 'HIDDEN'
    },
    {
      name: 'latches',
      class: 'Map',
      javaFactory: `return new HashMap();`,
      visibility: 'HIDDEN'
    },
    {
      name: 'entries',
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
      name: 'latch',
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'id',
          type: 'Long'
        }
      ],
      type: 'java.util.concurrent.CountDownLatch',
      javaCode: `
      // TODO: this is not unique.
      synchronized ( String.valueOf(id).intern() ) {
        CountDownLatch latch = (CountDownLatch) getLatches().get(id);
        if ( latch == null ) {
          latch = new CountDownLatch(1);
          getLogger().debug("latch", id);
          getLatches().put(id, latch);
        }
        return latch;
      }
      `
    },
    {
      name: 'register',
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'id',
          type: 'Long'
        }
      ],
      javaCode: `
      latch(x, id);
      `
    },
    {
      name: 'wait',
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'id',
          type: 'Long'
        }
      ],
      type: 'FObject',
      javaCode: `
      PM pm1= new PM(this.getClass().getSimpleName(), "wait-setup");
      CountDownLatch latch = null;
      try {
      synchronized ( String.valueOf(id).intern() ) {
        latch = (CountDownLatch) getLatches().get(id);
        if ( latch == null ) {
          List<MedusaEntry> list = ((ArraySink) getMedusaEntryDAO()
            .where(
              AND(
                EQ(MedusaEntry.INDEX, id),
                EQ(MedusaEntry.PROMOTED, true)
              )
            )
            .limit(1)
            .select(new ArraySink())).getArray();
          if ( list.size() > 0 ) {
            getLogger().debug("promoted", id);
            return list.get(0);
          }
          latch = latch(x, id);
        }
      }
      } finally {
        pm1.log(x);
      }
      PM pm = new PM(this.getClass().getSimpleName(), "wait");
      try {
        latch.await();
        return (FObject) getEntries().get(id);
      } catch (InterruptedException e) {
        // nop
        return null;
      } finally {
        pm.log(x);
        getLatches().remove(id);
        getEntries().remove(id);
      }
      `
    },
    {
      name: 'notify',
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'entry',
          type: 'foam.nanos.medusa.MedusaEntry'
        }
      ],
      javaCode: `
      Long id = entry.getIndex();
      CountDownLatch latch = null;
      synchronized ( String.valueOf(id).intern() ) {
        latch = (CountDownLatch) getLatches().get(id);
      }
      if ( latch == null ) {
        ReplayingInfo info = (ReplayingInfo) x.get("replayingInfo");
        if ( ! info.getReplaying() ) {
          getLogger().debug("notify", id, "Latch not found", entry.toSummary());
        }
        return;
      }
      MedusaEntry e = (MedusaEntry) getEntries().get(id);
      if ( e == null ) {
        getEntries().put(id, entry);
      }
      // getLogger().debug("notify", id);
      latch.countDown();
      `
    },
    {
      name: 'count',
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'id',
          type: 'Long'
        }
      ],
      type: 'Long',
      javaCode: `
      CountDownLatch latch = (CountDownLatch) getLatches().get(id);
      if ( latch == null ) {
        return 0;
      }
      return latch.getCount();
      `
   },
 ]
});
