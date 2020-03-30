/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntryAgent',

  implements: [
    'foam.core.ContextAgent'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger'
  ],

  properties: [
    {
      name: 'entry',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.MedusaEntry'
    },
    {
      name: 'delegate',
      class: 'foam.dao.DAOProperty',
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

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public MedusaEntryAgent(X x, MedusaEntry entry, DAO delegate) {
    setX(x);
    setEntry(entry);
    setDelegate(delegate);
  }
         `
        }));
      }
    }
  ],

  methods: [
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      MedusaEntry entry = getEntry();
      getLogger().debug("execute", entry.getIndex());
      try {
        getDelegate().put_(x, entry);
      } catch ( Exception e ) {
        getLogger().error("execute", e.getMessage(), entry, e);
        // TODO: Alarm
      }
      `
    }
  ]
});
