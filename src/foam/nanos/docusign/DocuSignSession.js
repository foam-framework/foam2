foam.CLASS({
  package: 'foam.nanos.docusign',
  name: 'DocuSignSession',

  properties: [
    {
      name: 'id',
      aliases: ['user'],
      class: 'Long'
    },
    {
      name: 'accessTokens',
      class: 'FObjectProperty',
      of: 'foam.nanos.docusign.DocuSignAccessTokens'
    },
    {
      name: 'userInfo',
      class: 'FObjectProperty',
      of: 'foam.nanos.docusign.DocuSignUserInfo'
    },
    {
      name: 'activeAccount',
      class: 'FObjectProperty',
      of: 'foam.nanos.docusign.DocuSignUserAccount'
    }
  ]
});
