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
    'foam.dao.InternalException'
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
      javaType: 'foam.core.PropertyInfo',
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
      name: 'axiom',
      javaFactory: 'return (foam.core.PropertyInfo)(getOf().getAxiomByName(getProperty()));'
    },
    {
      /** The starting sequence value. This will be calclated from the
        existing contents of the delegate DAO, so it is one greater
        than the maximum existing value. */
      class: 'Long',
      name: 'value',
      value: 1
    },
    { /** Returns a promise that fulfills when the maximum existing number
          has been found and assigned to this.value */
      name: 'calcDelegateMax_',
      hidden: true,
      expression: function(delegate, property) {
        // TODO: validate property self.of[self.property.toUpperCase()]
        var self = this;
        return self.delegate.select( // TODO: make it a pipe?
          self.MAX(self.property_)
        ).then(
          function(max) {
            if ( max.value ) self.value = max.value + 1;
          }
        );
      }
    },
    {
      /** @private */
      name: 'property_',
      hidden: true,
      expression: function(property, of) {
        var a = this.of.getAxiomByName(property);
        if ( ! a ) {
          throw this.InternalException.create({message:
              'SequenceNumberDAO specified with invalid property ' +
              property + ' for class ' + this.of
          });
        }
        return a;
      }
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
            obj[self.property_.name] = self.value++;
          }

          return self.delegate.put_(x, obj);
        });
      },
      javaCode: `
synchronized (this) {
  if ( ! isPropertySet("value") ) calcDelegateMax_();

  //if ( ! getAxiom().isSet(obj) ) {
  if ( (Long) getAxiom().get(obj) == 0 ) {
    getAxiom().set(obj, getValue());
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
/**
 * Calculates the next largest value in the sequence
 */
private void calcDelegateMax_() {
  Sink sink = foam.mlang.MLang.MAX(getAxiom());
  sink = getDelegate().select(sink);
  setValue((long) ( ( (foam.mlang.sink.Max) sink ).getValue() == null ? 1 : ( (Number) ( (foam.mlang.sink.Max) sink ).getValue() ).longValue() + 1.0 ));
}

public SequenceNumberDAO(foam.dao.DAO delegate) {
  System.err.println("Direct constructor use is deprecated. Use Builder instead.");
  setDelegate(delegate);
}
        `);
      },
    },
  ],
});
