foam.CLASS({
  package: 'foam.nanos.docusign.example',
  name: 'ExampleDocument',
  extends: 'foam.nanos.docusign.DocuSignDocument',

  implements: ['foam.nanos.docusign.DocuSignWritable'],

  javaImports: [
    'foam.nanos.docusign.DocuSignTag'
  ],

  properties: [
    {
      name: 'title',
      class: 'String',
      value: 'Example Document'
    },
    {
      name: 'terms',
      class: 'String',
      value: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc dapibus quis ante non consequat. Duis sed risus sed ipsum efficitur ornare et sit amet justo. Nullam efficitur maximus odio, et rhoncus tortor dapibus id. Mauris at turpis urna. Integer eu velit posuere, molestie urna at, bibendum dolor. Sed ac vestibulum dolor. Duis aliquam pretium molestie. Morbi mattis ornare semper.`
    }
  ],

  methods: [
    {
      name: 'getDocuSignHTML',
      type: 'String',
      javaCode: `
        return new DocuSignTag.Builder(getX()).setNodeName("html").build()
          .start("body")
            .start("h1")
              .write(getTitle())
            .end()
            .start("p")
              .write(getTerms())
              .initial()
            .end()
            .date()
            .signature()
          .end()
          .getDocuSignHTML();
      `
    }
  ]
});