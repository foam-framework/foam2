foam.CLASS({
  package: 'foam.nanos.docusign',
  name: 'DocuSignEnvelope',

  properties: [
    {
      name: 'status',
      class: 'String',
      value: 'sent'
    },
    {
      name: 'emailSubject',
      class: 'String'
    },
    {
      name: 'documents',
      class: 'FObjectArray',
      of: 'foam.nanos.docusign.DocuSignDocumentEntry'
    },
    {
      name: 'recipients',
      class: 'FObjectProperty',
      of: 'foam.nanos.docusign.DocuSignEnvelopeRecipients'
    }
  ],
});

foam.CLASS({
  package: 'foam.nanos.docusign',
  name: 'DocuSignEnvelopeRecipients',

  properties: [
    {
      name: 'signers',
      class: 'FObjectArray',
      of: 'foam.nanos.docusign.DocuSignRecipient'
    },
  ],
});

foam.CLASS({
  package: 'foam.nanos.docusign',
  name: 'DocuSignRecipient',

  properties: [
    {
      name: 'name',
      class: 'String'
    },
    {
      name: 'email',
      class: 'String'
    },
    {
      name: 'clientUserId',
      class: 'String'
    },
    {
      name: 'recipientId',
      class: 'String',
      value: '1'
    },
  ],
});