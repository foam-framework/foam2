foam.CLASS({
  package: 'foam.nanos.app',
  name: 'ContextLookupAppConfigService',
  implements: [
    'foam.nanos.app.AppConfigService'
  ],
  methods: [
    {
      name: 'getAppConfig',
      type: 'foam.nanos.app.AppConfig',
      javaCode: `
return (foam.nanos.app.AppConfig) getX().get("appConfig");
      `
    }
  ]
});