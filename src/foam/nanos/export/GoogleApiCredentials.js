foam.CLASS({
  package: 'foam.nanos.export',
  name: 'GoogleApiCredentials',
  properties: [
    {
      class: 'String',
      name: 'clientId',
    },
    {
      class: 'String',
      name: 'projectId',
    },
    {
      class: 'String',
      name: 'authUri',
    },
    {
      class: 'String',
      name: 'tokenUri',
    },
    {
      class: 'String',
      name: 'authProviderCertUrl',
    },
    {
      class: 'String',
      name: 'clientSecret',
    },
    {
      class: 'StringArray',
      name: 'redirectUris',
    },
    {
      class: 'String',
      name: 'javascriptOrigins',
    },
    {
      class: 'Int',
      name: 'port'
    },
    {
      class: 'String',
      name: 'tokensFolderPath'
    }
  ]
});