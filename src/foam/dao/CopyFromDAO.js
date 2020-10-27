/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
    package: 'foam.dao',
    name: 'CopyFromDAO',
    extends: 'foam.dao.ProxyDAO',

    documentation: `
        Copies objects of a given type to the expected output type.
    `,

    javaImports: [
        'foam.core.FObject',
        'foam.core.X',
        'foam.dao.DAO',
        'foam.dao.Sink',
        'foam.dao.ArraySink'
      ],

    properties: [
        {
            class: 'Class',
            name: 'innerClass'
        },
        {
            class: 'Class',
            name: 'outerClass'
        }
    ],
    
    axioms: [
      {
        name: 'javaExtras',
        buildJavaClass: function(cls) {
          cls.extras.push(`
            protected class DecoratedSink extends foam.dao.ProxySink
            {
                public DecoratedSink(X x, Sink delegate)
                {
                    super(x, delegate);
                    if (delegate == null)
                        delegate = new ArraySink();
                }

                @Override
                public void put(Object obj, foam.core.Detachable sub)
                {
                  try {
                    FObject innerObject = (FObject) obj;
                    FObject outerObject = (FObject) getOuterClass().newInstance();

                    outerObject = outerObject.copyFrom(innerObject);
                    getDelegate().put(outerObject, sub);
                  } catch ( Exception ex ) {
                    throw new RuntimeException("Cannot create new instance: " + ex.getMessage(), ex);
                  }
                }
            }
          `
        );
        }
      }
    ],

    methods: [
      {
        name: 'find_',
        javaCode: `
          try {
            if ( getOuterClass().isInstance(id) ) {
                FObject innerId = (FObject) getInnerClass().newInstance();
                innerId = innerId.copyFrom((FObject) id);
                id = innerId;
            }
            FObject innerObject = getDelegate().find_(x, id);
          
            // Do not attempt to convert if the object is null
            if ( innerObject == null ) return null;

            FObject outerObject = (FObject) getOuterClass().newInstance();
            outerObject = outerObject.copyFrom(innerObject);
            return outerObject;
          } catch ( Exception ex ) {
            throw new RuntimeException("Cannot create new instance: " + ex.getMessage(), ex);  
          }
        `
      },
      {
        name: 'select_',
        javaCode: `
            Sink decoratedSink = new DecoratedSink(x, sink);
            getDelegate().select_(x, decoratedSink, skip, limit, order, predicate);
            return sink;
        `
      },
      {
        name: 'put_',
        javaCode: `
          try {
            FObject outerObject = (FObject) obj;
            FObject innerObject = (FObject) getInnerClass().newInstance();
            
            // Save the object as the inner object
            innerObject = innerObject.copyFrom(outerObject);
            innerObject = getDelegate().put_(x, innerObject);

            // Return the outer object
            outerObject = (FObject) getOuterClass().newInstance();
            outerObject = outerObject.copyFrom(innerObject);

            return outerObject;
          } catch ( Exception ex ) {
            throw new RuntimeException("Cannot create new instance: " + ex.getMessage(), ex);  
          }
        `
      }
    ]
  });