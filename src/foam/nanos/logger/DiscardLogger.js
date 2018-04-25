/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'DiscardLogger',
  extends: [ 'foam.nanos.logger.ProxyLogger' ],

  properties: [
    {
      name: 'discardInfo',
      class: 'Boolean',
      value: false
    },
    {
      name: 'discardWarning',
      class: 'Boolean',
      value: false
    },
    {
      name: 'discardError',
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
    name: 'info',
    args: [
      {
      name: 'args',
      javaType: 'Object...'  
      }
    ],
    javaCode: `
        if ( ! get.discardInfo() ) {
          getDelegate().info(args);
        }
    `
    }
  ]
});