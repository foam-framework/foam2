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
    'java.util.concurrent.locks.ReentrantReadWriteLock',
    'java.util.concurrent.locks.ReentrantLock',
    'java.util.concurrent.locks.Lock'
  ],

  properties: [
    {
      class: 'Int',
      name: 'nextIndex'
    },
    {
      class: 'Int',
      name: 'fixedArraySize',
      value: 150
    },
    {
      class: 'Array',
      of: 'foam.core.FObject',
      name: 'fixedSizeArray',
      javaFactory: `return new foam.core.FObject[getFixedArraySize()];`
    },
    {
      class: 'Object',
      name: 'lock',  
      javaType: 'java.util.concurrent.locks.ReentrantLock',
      javaFactory: `return new java.util.concurrent.locks.ReentrantLock();`

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
Integer insertAt;
foam.core.FObject delegatedObject = getDelegate().put_(x, obj);
getLock().lock();
try {
  insertAt = getNextIndex();  
  if ( insertAt == getFixedArraySize() ) {
    insertAt = 0;
  }
  setNextIndex( insertAt + 1 );
} finally {
  getLock().unlock();
}
getFixedSizeArray()[insertAt] = delegatedObject;
return delegatedObject;
  `
    },
    {
      name: 'select_',
      javaReturns: 'foam.dao.Sink',
      javaCode: `
if (sink == null){
  sink = new ArraySink();
}
sink = prepareSink(sink);
Sink decorated = decorateSink_(sink, skip, limit, order, predicate);
Integer backCounter = getNextIndex() - 1 ;
for ( int i = 0; i < 100; i++ ) {
  try {
    decorated.put ( getFixedSizeArray()[backCounter] ,null );
    if (backCounter == 0 ) {
      backCounter = getFixedArraySize();
    }
    backCounter--;
  } catch (Exception e) {
    // is there a better way to handle this? if the array has nothing in it, you
    // need ths catch to catch an NPE
    System.err.print(" FSD select_ returned an NPE \\n" ) ;
  }
}
decorated.eof();
return sink;
`
    }
  ]
});

