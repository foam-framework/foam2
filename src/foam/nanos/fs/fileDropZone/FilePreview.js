/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs.fileDropZone',
  name: 'FilePreview',
  extends: 'foam.u2.View',

  documentation: 'iframe for file preview',

  properties: [
    {
      class: 'String',
      name: 'fileSrc'
    }
  ],

  css: `
    #file-iframe {
      height: 100%;
      width: 100%;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      this.data$.sub(() => this.showData());
    },

    function showData() {
      var iFrame = document.getElementById('file-iframe');
      if ( !iFrame ){
        this
          .start('iframe')
            .attrs({
                data: URL.createObjectURL(this.data[0].data.blob),
                id: 'file-iframe',
                name: 'file-iframe',
            })
         .end();
      } else {
        iFrame.src = URL.createObjectURL(this.data[0].data.blob);
      }
    }
  ]
})
