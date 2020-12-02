/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.lib',
  name: 'AndPropertyPredicate',
  implements: [ 'foam.lib.PropertyPredicate'],

  properties: [
    {
      class: 'Array',
      type: 'foam.lib.PropertyPredicate[]',
      name: 'delegates'
    }
  ],
    
  methods: [
    {
      name: 'propertyPredicateCheck',
      javaCode: `
  for ( foam.lib.PropertyPredicate p : getDelegates() ) {
    if ( ! p.propertyPredicateCheck(x, of, prop) ) {
      return false;
    }
  }

  return true;
`
    }
  ]
});
    
