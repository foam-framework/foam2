/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'UnreliableDAO',
  extends: 'foam.dao.ProxyDAO',

  messages: [
    {
      name: 'CANNOT_PERFORM_ERROR_MSG',
      message: 'UnreliableDAO decided you are unlucky.'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(
          `
            private double errorRate_ = 0.5;

            public UnreliableDAO(DAO delegate) {
              super();
              setDelegate(delegate);
              if ( delegate instanceof ProxyDAO ) {
                setX(((ProxyDAO)delegate).getX());
              }
            }
          
            public UnreliableDAO(double errorRate, DAO delegate) {
              this(delegate);
              errorRate_ = errorRate;
            }
          
            public UnreliableDAO(foam.core.X x, double errorRate, DAO delegate) {
              this(errorRate, delegate);
              setX(x);
            } 
          `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        if ( Math.random() < errorRate_ ) {
          throw new RuntimeException(CANNOT_PERFORM_ERROR_MSG);
        }
    
        return super.put_(x, obj);
      `
    },
    {
      name: 'remove_',
      javaCode: `
        if ( Math.random() < errorRate_ ) {
          throw new RuntimeException(CANNOT_PERFORM_ERROR_MSG);
        }
    
        return super.remove_(x, obj);
      `
    },
    {
      name: 'select_',
      javaCode: `
        if ( Math.random() < errorRate_ ) {
          throw new RuntimeException(CANNOT_PERFORM_ERROR_MSG);
        }
    
        return super.select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
        if ( Math.random() < errorRate_ ) {
          throw new RuntimeException(CANNOT_PERFORM_ERROR_MSG);
        }
    
        super.removeAll_(x, skip, limit, order, predicate);
      `
    }
  ]
});
