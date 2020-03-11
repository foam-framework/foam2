foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClientElectoralService',
  implements: [ 'foam.nanos.medusa.ElectoralService' ],
  
  properties: [
    {
      class: 'Stub',
      name: 'delegate',
      of: 'foam.nanos.medusa.ElectoralService'
    }
  ]
});
  
