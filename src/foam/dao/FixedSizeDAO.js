/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'FixedSizeDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'DAO that stores a fixed number of objects',

  javaImports: [
    'foam.dao.Sink',
    'org.apache.commons.collections.buffer.CircularFifoBuffer',
    'org.apache.commons.collections.Buffer',
    'org.apache.commons.collections.BufferUtils'
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
      javaType: 'org.apache.commons.collections.Buffer',
      javaFactory: `return BufferUtils.synchronizedBuffer(new org.apache.commons.collections.buffer.CircularFifoBuffer(getFixedArraySize())); `
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
sink = prepareSink(sink);
Sink decorated = decorateSink_(sink, skip, limit, order, predicate);
Object[] arrayObject = getFixedSizeArray().toArray();
for ( int i = 0; i < arrayObject.length; i++ ) {
  decorated.put( arrayObject[i], null );
}
decorated.eof();
return sink;
`
    }
  ]
});
