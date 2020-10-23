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

  css: `
    .file-iframe {
      height: 100%;
      width: 100%;
    }

    img {
      max-width: 100%;
      max-height: 100%;
    }

    .file-image-div {
      height: 100%;
      width: auto;
      max-height: 244px;
      max-width: 300px;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start('div')
          .addClass('file-image-div')
          .style({
            visibility: 'hidden'
          })
          .start('img')
            .addClass('file-image')
          .end()
        .end()
        .start('iframe')
          .addClass('file-iframe')
          .style({
            visibility: 'hidden'
          })
        .end();

      this.data$.sub(() => this.showData());
    },

    function showData() {
      let iFrame = document.getElementsByClassName('file-iframe')[0],
          image = document.getElementsByClassName('file-image')[0],
          div = document.getElementsByClassName('file-image-div')[0],
          url = '';

      iFrame.style.visibility = 'hidden';
      div.style.visibility = 'hidden';
      div.style.display = 'none';

      if ( ! this.data[0] ) {
        return;
      }

      url = URL.createObjectURL(this.data[this.data.length - 1].data.blob);

      if (this.data[this.data.length - 1].mimeType !== "application/pdf") {
        image.src = url;
        div.style.visibility = 'visible';
        div.style.display = 'block';
      } else {
        iFrame.src = url;
        iFrame.style.visibility = 'visible';
      }
    }
  ]
})
