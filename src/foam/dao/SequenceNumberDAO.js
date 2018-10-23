/**
 * @license
 * Copyright 2014 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'SequenceNumberDAO',
  extends: 'foam.dao.ProxyDAO',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    {
      flags: ['swift'],
      path: 'foam.mlang.sink.Max'
    }
  ],

  documentation: 'DAO Decorator which sets a specified property\'s value with an auto-increment sequence number on DAO.put() if the value is set to the default value.',

  properties: [
    {
      /** The property to set uniquely. */
      class: 'String',
      name: 'property',
      value: 'id'
    },
    {
      class: 'Long',
      name: 'startingValue',
    },
    {
      /** The starting sequence value. This will be calclated from the
        existing contents of the delegate DAO, so it is one greater
        than the maximum existing value. */
      class: 'Long',
      name: 'value',
      value: 1,
      swiftExpressionArgs: ['delegate', 'property_', 'startingValue'],
      swiftExpression: `
        let s = self.Max_create(["arg1": property_])
        _ = try? delegate.select(s)
        let v = s.value is Int ? (s.value as! Int) + 1 : 0
        return v >= startingValue ? v : startingValue
      `,
      javaFactory: `
        foam.mlang.sink.Max sink = (foam.mlang.sink.Max) foam.mlang.MLang.MAX(getProperty_());
        getDelegate().select(sink);
        long v = sink.getValue() instanceof Number ? ( (Number) sink.getValue() ).longValue() + 1 : 0;
        return v > getStartingValue() ? v : getStartingValue();
      `,
    },
    { /** Returns a promise that fulfills when the maximum existing number
          has been found and assigned to this.value */
      flags: ['js'],
      name: 'calcDelegateMax_',
      hidden: true,
      expression: function(delegate, property) {
        // TODO: validate property self.of[self.property.toUpperCase()]
        var self = this;
        return self.delegate.select( // TODO: make it a pipe?
          self.MAX(self.property_)
        ).then(
          function(max) {
            var v = foam.Number.isInstance(max.value) ? ( max.value + 1 ) : 0;
            self.value = v > self.startingValue ? v : self.startingValue
          }
        );
      },
    },
    {
      /** @private */
      name: 'property_',
      hidden: true,
      javaType: 'foam.core.PropertyInfo',
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
      swiftType: 'PropertyInfo',
      swiftExpressionArgs: ['property', 'of'],
      swiftExpression: `
        return of.axiom(byName: property) as! PropertyInfo
      `,
      expression: function(property, of) {
        var a = this.of.getAxiomByName(property);
        if ( ! a ) {
          throw this.InternalException.create({message:
              'SequenceNumberDAO specified with invalid property ' +
              property + ' for class ' + this.of
          });
        }
        return a;
      },
      javaFactory: 'return (foam.core.PropertyInfo)(getOf().getAxiomByName(getProperty()));'
    }
  ],

  methods: [
    /** Sets the property on the given object and increments the next value.
      If the unique starting value has not finished calculating, the returned
      promise will not resolve until it is ready. */
    {
      name: 'put_',
      code: function put_(x, obj) {
        var self = this;
        return this.calcDelegateMax_.then(function() {
          if ( ! obj.hasOwnProperty(self.property_.name) ) {
            obj[self.property_.name] = self.value;
            self.value++;
          }
          return self.delegate.put_(x, obj);
        });
      },
      swiftSynchronized: true,
      swiftCode: `
        if !property_.hasOwnProperty(obj) {
          property_.set(obj, value: value)
          value += 1
        }
        return try delegate.put_(x, obj)
      `,
      javaCode: `
        synchronized (this) {
          if ( (long) getProperty_().get(obj) == 0 ) {
            getProperty_().set(obj, getValue());
            setValue(getValue() + 1);
          }
        }
        return getDelegate().put_(x, obj);
      `,
    },
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public SequenceNumberDAO(foam.dao.DAO delegate) {
            this(1, delegate);
          }

          public SequenceNumberDAO(long value, foam.dao.DAO delegate) {
            System.err.println("Direct constructor use is deprecated. Use Builder instead.");
            setStartingValue(value);
            setDelegate(delegate);
          }
        `);
      }
    }
  ]
});
