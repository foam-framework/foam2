/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'DefaultDaggerService',

  implements: [
    'foam.nanos.medusa.DaggerService',
    'foam.nanos.NanoService',
  ],

  documentation: `Manage global indexes and hashes`,

  javaImports: [
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.util.concurrent.atomic.AtomicLong'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  private volatile AtomicLong globalIndex_ = new AtomicLong(1);
  private int linksIndex_ = 1;
          `
        }));
      }
    }
  ],

  properties: [
    {
      name: 'links',
      class: 'Array',
      javaFactory: 'return new foam.nanos.medusa.DaggerLink[2];'
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
    }
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
      MedusaEntry entry = getX().create(MedusaEntry.class);
      entry.setHash("aaaaaa");
      entry.setIndex(-1L);
      updateLinks(getX(), entry);

      entry = getX().create(MedusaEntry.class);
      entry.setHash("bbbbbb");
      entry.setIndex(-1L);
      updateLinks(getX(), entry);
      `
    },
    {
      name: 'getNextLinks',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'foam.nanos.medusa.DaggerLinks',
      javaCode: `
      return new DaggerLinks(
        x,
        globalIndex_.getAndIncrement(),
        (DaggerLink)getLinks()[0],
        (DaggerLink)getLinks()[1]
      );
      `
    },
    {
      name: 'updateLinks',
      synchronized: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'link',
          type: 'foam.nanos.medusa.DaggerLink'
        }
      ],
      javaCode: `
      linksIndex_ ^= 1;
      getLogger().debug("updateLinks", linksIndex_, link);
      getLinks()[linksIndex_] = link;
      `
    }
  ]
});
