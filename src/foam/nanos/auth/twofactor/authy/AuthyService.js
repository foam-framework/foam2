foam.CLASS({
  package: 'foam.nanos.auth.twofactor.authy',
  name: 'AuthyService',

  documentation: 'Implementation of 2FA using Authy',

  javaImports: [
    'com.authy.AuthyApiClient'
  ],

  properties: [
    {
      class: 'Object',
      name: 'client',
      javaType: 'com.authy.AuthyApiClient',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'debug',
      value: true
    },
    {
      class: 'String',
      name: 'apiKey'
    },
    {
      class: 'String',
      name: 'apiHost',
      javaFactory: `return getDebug() ? "http://sandbox-api.authy.com" : "https://api.authy.com";`
    }
  ],

  methods: [
    {
      name: 'start',
      javaReturns: 'void',
      javaCode: `setClient(new AuthyApiClient(getApiKey(), getApiHost(), getDebug()));`
    }
  ]
});