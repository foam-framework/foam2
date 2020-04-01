foam.CLASS({
  package: 'foam.nanos.docusign',
  name: 'DocuSignAccessTokens',

  properties: [
    {
      name: 'accessToken',
      aliases: ['access_token'],
      class: 'String'
    },
    {
      name: 'refreshToken',
      aliases: ['access_token'],
      class: 'String'
    },
    {
      name: 'expiresIn',
      aliases: ['expires_in'],
      class: 'Int'
    }
  ]
});