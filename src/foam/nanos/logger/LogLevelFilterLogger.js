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
      type: 'Void',
      args: [
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaCode: "if ( getLogError() ) getDelegate().error(args);"
    },
    {
      name: 'warning',
      type: 'Void',
      args: [
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaCode: "if ( getLogWarning() ) getDelegate().warning(args);"
    },
    {
      name: 'info',
      type: 'Void',
      args: [
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaCode: "if ( getLogInfo() ) getDelegate().info(args);"
    },
    {
      name: 'debug',
      type: 'Void',
      args: [
        {
          name: 'args',
          javaType: 'Object...'
        }
      ],
      javaCode: "if ( getLogDebug() ) getDelegate().debug(args);"
    }
  ]
});
