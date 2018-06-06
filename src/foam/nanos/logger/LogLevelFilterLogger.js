/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'LogLevelFilterLogger',
  extends: 'foam.nanos.logger.ProxyLogger',

  properties: [
    {
      name: 'logError',
      class: 'Boolean',
      value: true
    },
    {
      name: 'logWarning',
      class: 'Boolean',
      value: true
    },
    {
      name: 'logInfo',
      class: 'Boolean',
      value: true
    },
    {
      name: 'logDebug',
      class: 'Boolean',
      value: true
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
      javaCode: "if ( getLogError() ) getDelegate().error(args);"
    },
    {
      name: 'warning',
      args: [
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaReturns: 'void',
      javaCode: "if ( getLogWarning() ) getDelegate().warning(args);"
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
      javaCode: "if ( getLogInfo() ) getDelegate().info(args);"
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
      javaCode: "if ( getLogDebug() ) getDelegate().debug(args);"
    }
  ]
});
