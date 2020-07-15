foam.CLASS({
  package: 'foam.nanos.session.services',
  name: 'ClientHomeDenominationSessionServiceImpl',
  implements: [
    'foam.nanos.session.services.HomeDenominationSessionService'
  ],
  properties: [
    {
      class: 'Stub',
      of: 'foam.nanos.session.services.HomeDenominationSessionService',
      name: 'delegate'
    }
  ]
});