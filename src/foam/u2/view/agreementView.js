foam.CLASS({
  package: 'foam.u2.view',
  name: 'agreementView',
  extends: 'foam.u2.Controller',

  imports: [
      'fileDAO'
    ],

  css: `
    ^text {
        overflow-y: scroll;
        height: 500px;
        width: 100%;
        border: 1px solid #DDD;
        padding: 10px;
    }

    ^pdf embed {
      width: 100%;
      height: 500px;
    }
  `,

  properties: [
    {
      name: 'fileId'
    }
  ],

  methods: [
    async function initE() {
      this.SUPER();
      let file = await ctrl.__subContext__.fileDAO.find(this.fileId);
      if ( file ) {
        if ( file.mimeType === "application/pdf" ) {
          this
            .addClass(this.myClass("pdf"))
            .start('embed')
              .attrs({
                'src': URL.createObjectURL(file.data.blob),
                'type': file.mimeType
              })
            .end();
        } else if ( file.mimeType === "plain/text" ) {
          let text = await file.getText();
          this
            .addClass(this.myClass("text"))
            .start("p")
              .add(text)
            .end();
        }
      }
    }
  ]
})
