/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.session',
  name: 'Session',

  javaImports: [
    'java.util.Date'
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'Long',
      name: 'userId'
    },
    {
      class: 'DateTime',
      name: 'created',
      javaFactory: 'return new Date();'
    },
    {
      class: 'DateTime',
      name: 'lastUsed'
    },
    {
      class: 'Long',
      name: 'uses'
    },
    {
      class: 'DateTime',
      name: 'expiry',
      javaFactory: 'return new Date(System.currentTimeMillis()+30*24*60*60*1000);'
    },
    {
      class: 'String',
      name: 'hostname'
    },
    {
      class: 'Object',
      name: 'context',
      javaType: 'foam.core.X',
      hidden: true,
      transient: true
    }
  ]
});
