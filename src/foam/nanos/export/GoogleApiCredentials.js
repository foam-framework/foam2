foam.CLASS({
  package: 'foam.nanos.export',
  name: 'GoogleApiCredentials',
  properties: [
    {
      class: 'String',
      name: 'client_id',
    },
    {
      class: 'String',
      name: 'project_id',
    },
    {
      class: 'String',
      name: 'auth_uri',
    },
    {
      class: 'String',
      name: 'token_uri',
    },
    {
      class: 'String',
      name: 'auth_provider_x509_cert_url',
    },
    {
      class: 'String',
      name: 'client_secret',
    },
    {
      class: 'StringArray',
      name: 'redirect_uris',
    },
    {
      class: 'String',
      name: 'javascript_origins',
    },
    {
      class: 'Int',
      name: 'port'
    }
  ]
});