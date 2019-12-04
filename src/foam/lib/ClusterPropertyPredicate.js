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
