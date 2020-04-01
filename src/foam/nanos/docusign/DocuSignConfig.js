foam.CLASS({
  package: 'foam.nanos.docusign',
  name: 'DocuSignConfig',

  javaImports: [
    'org.apache.commons.codec.binary.Base64',
  ],
  
  properties: [
    {
      name: 'integrationKey',
      class: 'String'
    },
    {
      name: 'secretKey',
      class: 'String'
    },
    {
      name: 'oAuthBaseURI',
      class: 'String',
      value: 'https://account-d.docusign.com/oauth'
    }
  ],

  methods: [
    {
      name: 'getAuthorizationHeaderValue',
      type: 'String',
      javaCode: `
        return new String(Base64.encodeBase64(
          (getIntegrationKey()+":"+getSecretKey()).getBytes()
        ));
      `
    }
  ]
})