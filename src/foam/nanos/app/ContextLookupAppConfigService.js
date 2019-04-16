/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
return (foam.nanos.app.AppConfig) x.get("appConfig");
      `
    }
  ]
});