/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'FixedSizeDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    DAO that stores a fixed number of objects. Does not limit its delegate's
    storage. Rather, it is intended to be used in situations where the delegate
    does not store any data due to the amount of data being stored being
    prohibitively large. Instead, this DAO will store some of that data in
    memory, but it will start to replace old data after a certain point to
    prevent infinite growth.
    NOTE: Install via EasyDAO. It is important that when removeFromDelegate is true (the default) that this DAO is placed between the JDAO and it's delegate which is typically a MDOA or NullDAO.
  `,

  javaImports: [
    'foam.dao.Sink',
    'java.util.concurrent.locks.ReentrantLock'
  ],

  properties: [
    {
      documentation: 'when removing from internal circular buffer also remove from delegate DAO.',
      class: 'Boolean',
      name: 'removeFromDelegate',
      value: true
    },
    {
      class: 'Int',
      name: 'fixedDAOSize',
      value: 10000,
      documentation: `Desired size of the fixedSizeDAO`
    },
    {
      class: 'Int',
      name: 'nextIndex',
      hidden: true,
    },
    {
      class: 'Int',
      name: 'internalArraySize',
      javaFactory: `return ((int)  (1.1 *  (double) getFixedDAOSize() )); `,
      documentation: `array larger than FixedDAOSize, to allow for a point in
                      time view without blocking write access.
      `,
      hidden: true
    },
    {
      class: 'Array',
      of: 'foam.core.FObject',
      name: 'fixedSizeArray',
      javaFactory: `return new foam.core.FObject[ getInternalArraySize() ];`,
      hidden: true
    },
    {
      class: 'Object',
      name: 'lock',
      javaType: 'java.util.concurrent.locks.ReentrantLock',
      javaFactory: `return new java.util.concurrent.locks.ReentrantLock();`,
      hidden: true
    }
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'FObject'
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
  foam.core.FObject discard = getFixedSizeArray()[insertAt];
  getFixedSizeArray()[insertAt] = delegatedObject;
  if ( getRemoveFromDelegate() &&
       discard != null ) {
    getDelegate().remove_(x, discard);
  }
  return delegatedObject;
  `
    },
    {
      name: 'select_',
      javaCode: `
  if ( sink == null ) sink = new ArraySink();
  sink = prepareSink(sink);
  Sink decorated = decorateSink_(sink, skip, limit, order, predicate);

  Integer backCounter;

  if ( getNextIndex() <= 0 ) {
    backCounter = ( getInternalArraySize() - 1 );
  } else {
    backCounter = ( getNextIndex() - 1 );
  }

  for ( int i = 0; i < getFixedDAOSize() ; i++ ) {
    try {
      if ( getFixedSizeArray()[backCounter] == null ) {
        break;
      }
      decorated.put(getFixedSizeArray()[backCounter], null);
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
    },
    {
      name: 'find_',
      javaCode: `
  try {
    Integer arrID = Integer.parseInt(id.toString());
    return getFixedSizeArray()[ (arrID - 1) % getFixedSizeArray().length ];
  } catch (Exception e ){
    return getDelegate().find_(x,id);
  }
  `
    }

  ]
});
