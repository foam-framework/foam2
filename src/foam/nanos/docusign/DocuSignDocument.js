foam.CLASS({
  package: 'foam.nanos.docusign',
  name: 'DocuSignDocument',
  implements: ['foam.nanos.docusign.DocuSignWritable'],

  properties: [
    {
      name: 'signingURL',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'getDocuSignHTML',
      type: 'String',
      javaCode: `
        return new DocuSignTag.Builder(getX()).setNodeName("html").build()
          .start("body")
            .signature()
          .end()
          .getDocuSignHTML();
      `
    }
  ]
});