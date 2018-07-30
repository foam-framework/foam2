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
    'java.util.concurrent.locks.ReentrantLock'  
  ],

  properties: [
    {
      class: 'Int',
      name: 'nextIndex'
    },
    {
      class: 'Int',
      name: 'fixedDAOSize',
      value: 10000,
      documentation: `Desired size of the fixedSizeDAO`
    },
    {
      class: 'Int',
      name: 'internalArraySize',
      private: true,
      javaFactory: `return ((int)  (1.1 *  (double) getFixedDAOSize() )); `,
      documentation: `array larger than FixedDAOSize, to allow for a point in 
                      time view without blocking write access.
      `
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
if ( sink == null ) sink = new ArraySink();
sink = prepareSink(sink);
Sink decorated = decorateSink_(sink, skip, limit, order, predicate);

Integer backCounter;

if ( getNextIndex() == 0 ) {
  backCounter = ( getInternalArraySize() - 1 ); 
} else {
  backCounter = ( getNextIndex() - 1 );
}

if ( getNextIndex() < 0 ) backCounter = ( getInternalArraySize() - 1 );

for ( int i = 0; i < getFixedDAOSize() ; i++ ) {
  try {
   if ( getFixedSizeArray()[backCounter] == null ){
      break;
    }
    decorated.put ( getFixedSizeArray()[backCounter], null );
    if ( backCounter == 0 ) {
      backCounter = getInternalArraySize();
    } 
    backCounter--;
  } catch (Exception e) {
    e.printStackTrace();
    break;
  }
}
decorated.eof();
return sink;
`
    }
  ]
});

