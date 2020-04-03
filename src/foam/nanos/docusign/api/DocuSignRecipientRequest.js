foam.CLASS({
  package: 'foam.nanos.docusign',
  name: 'DocuSignRecipientRequest',

  properties: [
    {
      name: 'userName',
      class: 'String'
    },
    {
      name: 'email',
      class: 'String'
    },
    {
      name: 'returnUrl',
      class: 'String'
    },
    {
      name: 'recipientId',
      class: 'String',
      value: '1'
    },
    {
      name: 'clientUserId',
      class: 'String'
    },
    {
      name: 'authenticationMethod',
      class: 'String',
      value: 'email'
    },
  ]
});

foam.CLASS({
  package: 'foam.nanos.docusign',
  name: 'DocuSignRecipientResponse',

  properties: [
    {
      name: 'url',
      class: 'String'
    }
  ]
});