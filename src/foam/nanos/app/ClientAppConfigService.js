foam.CLASS({
  package: 'foam.nanos.app',
  name: 'ClientAppConfigService',
  extends: 'foam.dao.AbstractDAO',
  properties: [
    {
      class: 'Stub',
      of: 'foam.nanos.app.AppConfigService',
      name: 'delegate'
    }
  ]
});