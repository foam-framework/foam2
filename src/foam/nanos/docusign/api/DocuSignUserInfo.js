foam.CLASS({
  package: 'foam.nanos.docusign',
  name: 'DocuSignUserInfo',

  properties: [
    {
      name: 'id',
      aliases: ['sub'],
      class: 'String'
    },
    {
      name: 'name',
      class: 'String'
    },
    {
      name: 'email',
      class: 'String'
    },
    {
      name: 'accounts',
      class: 'FObjectArray',
      of: 'foam.nanos.docusign.DocuSignUserAccount'
    }
  ]
});