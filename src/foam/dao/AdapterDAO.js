/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'AdapterDAO',
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
          code: function(ctx, obj) {
            if ( ! obj ) return obj;
            if ( ! this.of.isInstance(obj) ) return obj;
            return this.to.create(obj, ctx || this.__subContext__);
          },
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
          code: function put(o, sub) {
            this.delegate.put(this.adapt(o), sub);
          },
          javaCode: `
            FObject innerObject = (FObject) obj;
            FObject outerObject = adapt(getX(), innerObject);
            getDelegate().put(outerObject, sub);
          `
        },
        {
          name: 'remove',
          code: function remove(o, sub) {
            this.delegate.remove(this.adapt(o), sub);
          },
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
      postSet: function(old, nu) {
        if ( ! nu ) return;
        foam.assert(
            nu.of === this.to,
            'Expect AdapterDAO.delegate.of === AdapterDAO.to');
      }
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
      code: function(ctx, obj) {
        if ( ! obj ) return obj;
        if ( ! this.of.isInstance(obj) ) return obj;
        return this.to.create(obj, ctx || this.__subContext__);
      },
      javaCode: `
        FObject delegateObject;
        FObject ofObject;
        try {
          ofObject = (FObject) obj;
          delegateObject = (FObject) getTo().newInstance();
          delegateObject = delegateObject.copyFrom(ofObject);
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
      code: function(ctx, obj) {
        if ( ! obj ) return obj;
        if ( ! this.to.isInstance(obj) ) return obj;
        return this.of.create(obj, ctx || this.__subContext__);
      },
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
      code: function(order) { return order; },
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
      code: function(predicate) { return predicate; },
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
      code: function put_(ctx, obj) {
        return this.delegate.put_(ctx, this.adaptToDelegate(ctx, obj)).
          then(this.adaptFromDelegate.bind(this, ctx));
      },
      javaCode: `
          FObject innerObject = adaptToDelegate(x, (FObject) obj);
          innerObject = getDelegate().put_(x, innerObject);
          return adaptFromDelegate(x, innerObject);
        `
    },
    {
      name: 'remove_',
      code: function remove_(ctx, obj) {
        return this.delegate.remove_(ctx, this.adaptToDelegate(ctx, obj)).
          then(this.adaptFromDelegate.bind(this, ctx));
      },
      javaCode: `
        if ( getOf().isInstance(obj) ) {
          obj = adaptToDelegate(x, (FObject) obj);
        }
        return getDelegate().remove_(x, obj);
      `
    },
    {
      name: 'find_',
      code: function find_(ctx, objOrId) {
        return this.delegate.find_(ctx, this.adaptToDelegate(ctx, objOrId)).
          then(this.adaptFromDelegate.bind(this, ctx));
      },
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
      code: function select_(ctx, sink, skip, limit, order, predicate) {
        sink = sink || this.ArraySink.create();
        var adapterSink = this.AdapterSink.create({
          delegate: sink,
          adapt: this.adaptFromDelegate.bind(this, ctx)
        });
        return this.delegate.select_(
                ctx, adapterSink, skip, limit,
                this.adaptOrder(order), this.adaptPredicate(predicate)).
            then(function() { return sink; });
      },
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
      code: function removeAll_(ctx, skip, limit, order, predicate) {
        return this.delegate.removeAll_(
            ctx, skip, limit,
            this.adaptOrder(order), this.adaptPredicate(predicate));
      },
      javaCode: `
        getDelegate().removeAll_(x, skip, limit, adaptOrder(order), adaptPredicate(predicate));
      `
    }
  ]
});
