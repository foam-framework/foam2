foam.CLASS({
  package: 'foam.nanos.session.services',
  name: 'ClientLocalSettingsServiceImpl',
  implements: [
    'foam.nanos.session.services.LocalSettingsService'
  ],
  properties: [
    {
      class: 'Stub',
      of: 'foam.nanos.session.services.LocalSettingsService',
      name: 'delegate'
    }
  ]
});