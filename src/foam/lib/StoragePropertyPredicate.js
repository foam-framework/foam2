/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.lib',
  name: 'StoragePropertyPredicate',
  implements: [ 'foam.lib.PropertyPredicate'],

  methods: [
    {
      name: 'propertyPredicateCheck',
      javaCode: `
return ! prop.getStorageTransient();
`
    }
  ]
});
