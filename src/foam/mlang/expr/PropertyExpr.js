/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.expr',
  name: 'PropertyExpr',
  extends: 'foam.mlang.AbstractExpr',

  implements: [ 'foam.core.Serializable' ],

  documentation: `  
    An Expr whose value is a property. Even though Property implements Expr
    directly, we want this so FObjectView can list this as an option for a
    concrete implementation of Expr instead of listing every property of every
    model.
  `,

  // TODO: Find a better way to get this to work. I originally just had one
  // property with an adapt method, but I couldn't get things working that way,
  // so I added a second property that's a simple string and used that to do a
  // foam.lookup to try and see if you typed in a real property and if so, then
  // set the "real" property property.
  properties: [
    {
      name: 'property',
      visibility: 'HIDDEN',
      // Set the view to a "null view" so we don't set up any data binding
      // between this view and the property, which causes problems when the
      // view overwrites this property's value.
      view: { class: 'foam.u2.View' },
      javaType: 'foam.core.PropertyInfo',
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
    },
    {
      class: 'String',
      name: 'propertyName',
      label: 'Property',
      documentation: 'A vanity property to make `property` editable.',
      postSet: function(oldValue, newValue) {
        var propertyName = newValue;
        if ( typeof propertyName !== 'string' ) return;
        try {
          var lastIndex = propertyName.lastIndexOf('.');
          var classId = propertyName.substring(0, lastIndex);
          var cls = foam.lookup(classId, true);
          var property = cls.getAxiomByName(propertyName.substring(lastIndex + 1));
          this.property = property;
        } catch (err) {}
      },
      view: {
        class: 'foam.u2.TextField',
        onKey: true
      },
      validationPredicates: [
        {
          args: ['property', 'propertyName'],
          predicateFactory: function(e) {
            return e.HAS(foam.mlang.expr.PropertyExpr.PROPERTY);
          },
          errorString: 'Invalid property.'
        }
      ]
    }
  ],

  methods: [
    {
      name: 'f',
      code: function(obj) { return this.property.f(obj); },
      javaCode: 'return getProperty().f(obj);'
    },
    {
      name: 'createStatement',
      javaCode: 'return getProperty().getName();'
    }
  ]
});
