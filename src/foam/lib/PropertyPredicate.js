/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.lib',
  name: 'PropertyPredicate',

  methods: [
    {
      name: 'propertyPredicateCheck',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'of',
          type: 'String'
        },
        {
          name: 'prop',
          javaType: 'foam.core.PropertyInfo'
        }
      ]
    }
  ]
});
  
