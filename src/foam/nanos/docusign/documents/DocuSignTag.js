foam.CLASS({
  package: 'foam.nanos.docusign',
  name: 'DocuSignTag',
  flags: ['java'],

  implements: [
    'foam.nanos.docusign.DocuSignWritable'
  ],

  javaImports: [
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      name: 'nodeName',
      class: 'String',
      javaPostSet: `
        if ( nodeName_ != null ) {
          // IMG is the only DocuSign-allowed tag where
          // the end tag is illegal.
          if (
            "img".equals(nodeName_.toLowerCase())
            || nodeName_.toLowerCase().startsWith("ds-")
          ) {
            setEndTagIsIllegal(true);
          } else {
            setEndTagIsIllegal(false);
          }
        }
      `,
      javaGetter: `
        return nodeName_.toLowerCase();
      `
    },
    {
      name: 'endTagIsIllegal',
      class: 'Boolean'
    },
    {
      name: 'children',
      class: 'FObjectArray',
      of: 'foam.nanos.docusign.DocuSignWritable'
    },
    {
      name: 'parent',
      class: 'FObjectProperty',
      of: 'foam.nanos.docusign.DocuSignTag'
    },
    {
      name: 'style',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'start',
      args: [
        { name: 'nodeName', type: 'String' }
      ],
      type: 'DocuSignTag',
      javaCode: `
        DocuSignTag el = new DocuSignTag.Builder(getX())
          .setParent(this)
          .setNodeName(nodeName)
          .build();
        addChild(el);
        return el;
      `
    },
    {
      name: 'end',
      type: 'DocuSignTag',
      javaCode: `
        return getParent();
      `
    },
    {
      name: 'addChild',
      args: [
        { name: 'child', type: 'foam.nanos.docusign.DocuSignWritable' }
      ],
      // TODO: if this ever happens a lot, it should be reimplemented
      javaCode: `
        DocuSignWritable[] newArry = new DocuSignWritable[getChildren().length + 1];
        System.arraycopy(getChildren(), 0, newArry, 0, getChildren().length);
        newArry[getChildren().length] = child;
        setChildren(newArry);
      `
    },
    {
      name: 'write',
      args: [
        { name: 'text', type: 'String' }
      ],
      type: 'DocuSignTag',
      javaCode: `
        DocuSignWritable s = new DocuSignString(text);
        addChild(s);
        return this;
      `
    },
    {
      name: 'signature',
      type: 'DocuSignTag',
      javaCode: `
        addChild(new DocuSignTag.Builder(getX())
          .setNodeName("ds-signature")
          .build());
        return this;
      `
    },
    {
      name: 'initial',
      type: 'DocuSignTag',
      javaCode: `
        addChild(new DocuSignTag.Builder(getX())
          .setNodeName("ds-initial")
          .build());
        return this;
      `
    },
    {
      name: 'date',
      type: 'DocuSignTag',
      javaCode: `
        addChild(new DocuSignTag.Builder(getX())
          .setNodeName("ds-date-signed")
          .build());
        return this;
      `
    },
    {
      name: 'getDocuSignHTML',
      type: 'String',
      javaCode: `
        String style = SafetyUtil.isEmpty(getStyle())
          ? "" : " style=\\""+getStyle().trim()+"\\"";
        if ( getEndTagIsIllegal() ) {
          return "<"+getNodeName()+style+" />";
        }
        String html = "<"+getNodeName()+style+">";
        for ( DocuSignWritable writable : getChildren() ) {
          html += writable.getDocuSignHTML();
        }
        html += "</"+getNodeName()+">";
        return html;
      `
    }
  ]
});
