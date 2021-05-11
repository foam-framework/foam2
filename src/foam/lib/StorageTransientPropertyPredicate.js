/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.lib',
  name: 'StorageTransientPropertyPredicate',
  implements: [ 'foam.lib.PropertyPredicate'],

  documentation: 'Return true if this property is storageTransient.  The StoragePropertPredicate test for NOT storage transient, and should have been named as such.',

  methods: [
    {
      name: 'propertyPredicateCheck',
      javaCode: `
return prop.getStorageTransient();
`
    }
  ]
});
