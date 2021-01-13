/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.lib',
  name: 'ClusterPropertyPredicate',
  implements: [ 'foam.lib.PropertyPredicate'],
  javaImports: [
    'foam.nanos.auth.AuthService'
  ],
  
  methods: [
    {
      name: 'propertyPredicateCheck',
      javaCode: `
return ! prop.getClusterTransient();
`
    }
  ]
});
