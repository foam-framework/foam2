  foam.CLASS({
    package: 'foam.lib',
    name: 'NetworkPropertyPredicate',
    implements: [ 'foam.lib.PropertyPredicate'],
    javaImports: [
      'foam.nanos.auth.AuthService'
    ],
    
    methods: [
      {
        name: 'propertyPredicateCheck',
        javaCode: `
  return ! prop.getNetworkTransient();
  `
      }
    ]
  });
    