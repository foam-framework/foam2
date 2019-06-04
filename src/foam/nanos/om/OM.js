/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.om',
  name: 'OM',

  documentation: `An Operational Measure which captures the count of some event.`,

  implements: [
    'foam.nanos.analytics.Foldable'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO'
  ],

  ids: ['name', 'created'],

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      name: 'created',
      class: 'DateTime',
      factory: function() {
        return new Date();
      },
      javaFactory: `return new java.util.Date();`
    }
  ],

  methods: [
    {
      name: 'log',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'X'
        }
      ],
      javaCode: `
      if ( x == null ) return;
      DAO omDAO = (DAO) x.get("omDAO");
      if ( omDAO != null ) omDAO.put(this);
`
    },
    {
      name: 'doFolds',
      javaCode: `
      // We only care about the name, everything else is filler 
      fm.foldForState(getName(), getCreated(), 1);
      `
    }
  ]
});
