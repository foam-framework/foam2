foam.CLASS({
  package: 'foam.nanos.docusign',
  name: 'DocuSignString',
  flags: ['java'],

  implements: [
    'foam.nanos.docusign.DocuSignWritable'
  ],

  javaImports: [
    'org.apache.commons.text.StringEscapeUtils'
  ],

  properties: [
    {
      name: 'value',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'getDocuSignHTML',
      type: 'String',
      javaCode: `
        return StringEscapeUtils.escapeHtml4(getValue());
      `
    }
  ]
});
