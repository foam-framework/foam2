/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'PurgeSink',
  extends: 'foam.dao.ProxySink',

  documentation: `Remove old entries from MedusaEntry DAO and cleanup MedusaRegistry`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.Sink',
    'foam.nanos.medusa.MedusaRegistry'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public PurgeSink(X x, Sink delegate) {
    super(x, delegate);
  }
         `
        }));
      }
    }
  ],

  properties: [
    {
      documentation: 'MedusaRegistry for the life of the Sink',
      name: 'registry',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.MedusaRegistry',
      javaFactory: 'return (MedusaRegistry) getX().get("medusaRegistry");'
    }
  ],

  methods: [
    {
      name: 'put',
      args: [
        {
          name: 'obj',
          type: 'Object'
        },
        {
          name: 'sub',
          type: 'foam.core.Detachable'
        }
      ],
      javaCode: `
      MedusaEntry entry = (MedusaEntry) obj;
      getRegistry().notify(getX(), entry);
      getDelegate().put(entry, sub);
      `
    },
    {
      name: 'remove',
      javaCode: `//nop`
    },
    {
      name: 'eof',
      javaCode: `// nop`
    },
    {
      name: 'reset',
      javaCode: `//nop`
    }
  ]
});
