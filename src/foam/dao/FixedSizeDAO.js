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
    // why am I using a ReentractLock ?
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
      value: 10000
    },
    {
      class: 'Int',
      name: 'internalArraySize',
      private: true,
      javaFactory: `return ( (int)  (1.1 *  (double) getFixedArraySize() ) ); `
    },
    {
      class: 'Array',
      of: 'foam.core.FObject',
      name: 'fixedSizeArray',
      javaFactory: `return new foam.core.FObject[ getInternalArraySize() ];`
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
  if ( insertAt == getInternalArraySize() ) {
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

Integer backCounter;

if (getNextIndex() == 0 ) {
  backCounter = ( getInternalArraySize() - 1 ); 
} else {
  backCounter = ( getNextIndex() - 1 );
}

for ( int i = 0; i < getFixedArraySize() ; i++ ) {
  try {
   if ( getFixedSizeArray()[backCounter] == null ){
      break;
    }
    decorated.put ( getFixedSizeArray()[backCounter] ,null );
    if (backCounter == 0 ) {
      backCounter = getInternalArraySize();
    } 
    backCounter--;
  } catch (Exception e) {
    System.err.print(" FSD select_ returned an NPE \\n" ) ;
    break;
  }
}
decorated.eof();
return sink;
`
    }
  ]
});

