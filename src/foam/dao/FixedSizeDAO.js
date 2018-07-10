/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'FixedSizeDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: function () {/*
    DAO Decorator that stores a fixed number of objects.
  */},

  javaImports: [
    'org.apache.commons.collections.buffer.CircularFifoBuffer',
    'foam.dao.Sink',
  ],

  properties: [
    {
      class: 'Int',
      name: 'fixedArraySize',
      value: 10000
    },
    {
      class: 'Object',
      name: 'FixedSizeArray',
      javaType: 'org.apache.commons.collections.buffer.CircularFifoBuffer',
      javaFactory: `return new org.apache.commons.collections.buffer.CircularFifoBuffer(getFixedArraySize()); `
    }
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          of: 'foam.core.X'
        },
        {
          name: 'obj',
          of: 'foam.core.FObject',
        }
      ],
      javaCode: `
      foam.core.FObject delegatedObject = getDelegate().put_(x, obj);
      getFixedSizeArray().add(delegatedObject);
      return delegatedObject;
  `
    },
    {
      name: 'select_',
      javaReturns: 'foam.dao.Sink',
      javaCode: `
if ( sink == null ) {
  sink = new foam.dao.ArraySink();
}
Object[] tester = getFixedSizeArray().toArray();
for (int i = 0; i < tester.length; i++){
  sink.put(tester[i],null);
}
return sink;
        `
    }
  ]
});
