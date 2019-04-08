foam.CLASS({
  package: 'foam.nanos.mrac',
  name: 'ClientElectoralService',
  implements: [ 'foam.nanos.mrac.ElectoralService' ],
  
  properties: [
    {
      class: 'Stub',
      name: 'delegate',
      of: 'foam.nanos.mrac.ElectoralService'
    }
  ]
});
  