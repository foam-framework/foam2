foam.CLASS({
  package: 'foam.nanos.docusign',
  name: 'DocuSignDocumentEntry',

  properties: [
    {
      name: 'name',
      class: 'String'
    },
    {
      name: 'documentId',
      class: 'String',
      value: '1'
    },
    {
      name: 'htmlDefinition',
      class: 'FObjectProperty',
      of: 'foam.nanos.docusign.DocuSignHTMLDefinition'
    }
  ]
});

foam.CLASS({
  package: 'foam.nanos.docusign',
  name: 'DocuSignHTMLDefinition',

  properties: [
    {
      name: 'source',
      class: 'String'
    }
  ]
});