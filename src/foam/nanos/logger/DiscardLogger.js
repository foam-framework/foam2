/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'DiscardLogger',
  extends: 'foam.nanos.logger.ProxyLogger',
 
  properties: [
    {
      name: 'discardError',
      class: 'Boolean',
      value: false
    },
    {
      name: 'discardWarn',
      class: 'Boolean',
      value: false
    },
    {
      name: 'discardInfo',
      class: 'Boolean',
      value: false
    },
    {
      name: 'discardDebug',
      class: 'Boolean',
      value: false
    }
  ],

  methods: [
    {
      name: 'error',
      args: [
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaReturns: 'void',
      javaCode: `
  if ( ! getDiscardError() ) {
    getDelegate().error(args);
  }
`
    },
    {
      name: 'warn',
      args: [
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaReturns: 'void',
      javaCode: `
  if ( ! getDiscardWarn() ) {
    getDelegate().warn(args);
  }
`
    },
    {
      name: 'info',
      args: [
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaReturns: 'void',
      javaCode: `
  if ( ! getDiscardInfo() ) {
    getDelegate().info(args);
  }
`
    },
    {
      name: 'debug',
      args: [
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaReturns: 'void',
      javaCode: `
  if ( ! getDiscardDebug() ) {
    getDelegate().debug(args);
  }
`
    }
  ]

});

