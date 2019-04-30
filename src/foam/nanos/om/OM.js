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
    'foam.nanos.auth.CreatedAware'
  ],

  javaImports: [
    'foam.core.X'
  ],

  properties: [
    {
      class: 'Class',
      name: 'classType'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      name: 'created',
      class: 'DateTime'
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
    OMLogger logger = (OMLogger) x.get(DAOOMLogger.SERVICE_NAME);
    if ( logger != null ) logger.log(this);
`
    }
  ]
});
