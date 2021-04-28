/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'CopyFromDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `DAO for adapting between "of" input type and "to" delegate
      type. I.e., accept put(<instance-of-"of">), and
      this.delegate.of === this.to.`,

  requires: [ 'foam.dao.ArraySink' ],

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.dao.ArraySink',
    'foam.mlang.order.Desc',
    'foam.mlang.order.ThenBy',
    'foam.mlang.predicate.Predicate'
  ],

  classes: [
    {
      name: 'AdapterSink',
      extends: 'foam.dao.ProxySink',

      properties: [
        {
          class: 'Class',
          name: 'of'
        }
      ],

      methods: [
        {
          name: 'adapt',
          type: 'FObject',
          args: [
            {
              name: 'ctx',
              type: 'X'
            },
            {
              name: 'obj',
              type: 'FObject'
            }
          ],
          javaCode: `
            FObject innerObject;
            FObject outerObject;
            try {
              innerObject = (FObject) obj;
              outerObject = (FObject) getOf().newInstance();
              outerObject = outerObject.copyFrom(innerObject);
            } catch ( Exception ex ) {
              throw new RuntimeException("Cannot adapt: " + ex.getMessage(), ex);
            }
            return outerObject;
          `
        },
        {
          name: 'put',
          javaCode: `
            FObject innerObject = (FObject) obj;
            FObject outerObject = adapt(getX(), innerObject);
            getDelegate().put(outerObject, sub);
          `
        },
        {
          name: 'remove',
          javaCode: `
            FObject innerObject = (FObject) obj;
            FObject outerObject = adapt(getX(), innerObject);
            getDelegate().remove(outerObject, sub);
          `
        }
      ]
    }
  ],

  properties: [
    {
      name: 'delegate',
    },
    {
      class: 'Class',
      name: 'to',
      documentation: '"of" of delegate.'
    }
  ],

  methods: [
    {
      name: 'adaptToDelegate',
      type: 'FObject',
      args: [
        {
          name: 'ctx',
          type: 'X'
        },
        {
          name: 'obj',
          type: 'FObject'
        }
      ],
      javaCode: `
        FObject delegateObject;
        FObject ofObject;
        try {
          ofObject = (FObject) obj;

          if ( ofObject.isPropertySet("id") ) {
            delegateObject = (FObject) getDelegate().find(obj.getProperty("id"));
            delegateObject = delegateObject.copyFrom(ofObject);
          } else {
            delegateObject = (FObject) getTo().newInstance();
            delegateObject = delegateObject.copyFrom(ofObject);
          }
        } catch ( Exception ex ) {
          throw new RuntimeException("Cannot adapt to delegate: " + ex.getMessage(), ex);
        }
        return delegateObject;
      `
    },
    {
      name: 'adaptFromDelegate',
      type: 'FObject',
      args: [
        {
          name: 'ctx',
          type: 'X'
        },
        {
          name: 'obj',
          type: 'FObject'
        },
      ],
      javaCode: `
        FObject delegateObject;
        FObject ofObject;
        try {
          delegateObject = (FObject) obj;
          ofObject = (FObject) getOf().newInstance();
          ofObject = ofObject.copyFrom(delegateObject);
        } catch ( Exception ex ) {
          throw new RuntimeException("Cannot adapt from delegate: " + ex.getMessage(), ex);
        }
        return ofObject;
      `
    },
    {
      name: 'adaptOrder',
      type: 'foam.mlang.order.Comparator',
      args: [
        {
          name: 'order',
          type: 'foam.mlang.order.Comparator',
        }
      ],
      javaCode: `
        if ( order == null )
          return order;

        if ( order instanceof PropertyInfo ) {
          PropertyInfo outerOrder = (PropertyInfo) order;
          PropertyInfo innerOrder = (PropertyInfo) getTo().getAxiomByName(outerOrder.getName());
          order = innerOrder;
        } else if ( order instanceof Desc ) {
          Desc desc = (Desc) order;
          desc.setArg1(adaptOrder(desc.getArg1()));
        } else if ( order instanceof ThenBy ) {
          ThenBy thenBy = (ThenBy) order;
          thenBy.setHead(adaptOrder(thenBy.getHead()));
          thenBy.setTail(adaptOrder(thenBy.getTail()));
        }

        return order;
      `
    },
    {
      name: 'adaptPredicate',
      type: 'foam.mlang.predicate.Predicate',
      args: [
        {
          name: 'predicate',
          type: 'foam.mlang.predicate.Predicate'
        }
      ],
      javaCode: `
        if ( predicate == null || !( predicate instanceof FObject ))
          return predicate;

        FObject obj = (FObject) predicate;
        String[] propertiesToCheck = new String[] { "args", "arg1", "arg2" };
        for ( var propertyToCheck : propertiesToCheck ) {
          if ( obj.isPropertySet(propertyToCheck)) {
            Object arg = obj.getProperty(propertyToCheck);
            if ( arg != null ) {
              if ( arg instanceof Predicate ) {
                arg = adaptPredicate((Predicate) arg);
              } else if ( arg instanceof PropertyInfo ) {
                PropertyInfo outerProperty = (PropertyInfo) arg;
                PropertyInfo innerProperty = (PropertyInfo) getTo().getAxiomByName(outerProperty.getName());
                arg = (Object) (( innerProperty != null ) ? innerProperty : outerProperty);
              } else if ( arg instanceof Predicate[] ) {
                Predicate[] array = (Predicate[]) arg;
                for ( int i = 0; i < array.length; i++ ) {
                  array[i] = adaptPredicate(array[i]);
                }
              }
              obj.setProperty(propertyToCheck, arg);
            }
          }
        }

        return predicate;
      `
    },
    {
      name: 'put_',
      javaCode: `
          FObject innerObject = adaptToDelegate(x, (FObject) obj);
          innerObject = getDelegate().put_(x, innerObject);
          return adaptFromDelegate(x, innerObject);
        `
    },
    {
      name: 'remove_',
      javaCode: `
        if ( getOf().isInstance(obj) ) {
          obj = adaptToDelegate(x, (FObject) obj);
        }
        return getDelegate().remove_(x, obj);
      `
    },
    {
      name: 'find_',
      javaCode: `
          if ( getOf().isInstance(id) ) {
            id = adaptToDelegate(x, (FObject) id);
          }

          FObject innerObject = getDelegate().find_(x, id);

          // Do not attempt to convert if the object is null
          if ( innerObject == null ) return null;

          return adaptFromDelegate(x, innerObject);
        `
    },
    {
      name: 'select_',
      javaCode: `
            Sink decoratedSink = new AdapterSink.Builder(x)
              .setDelegate(sink != null ? sink : new ArraySink())
              .setOf(this.getOf())
              .build();
            getDelegate().select_(x, decoratedSink, skip, limit, adaptOrder(order), adaptPredicate(predicate));
            return sink;
        `
    },
    {
      name: 'removeAll_',
      javaCode: `
        getDelegate().removeAll_(x, skip, limit, adaptOrder(order), adaptPredicate(predicate));
      `
    }
  ]
});
