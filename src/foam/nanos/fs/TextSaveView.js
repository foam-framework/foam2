/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'TextSaveView',
  extends: 'foam.u2.Element',

  documentation: 'view to save plain text as file',

  requires: [
    'foam.blob.BlobBlob',
    'foam.nanos.fs.File'
  ],

  properties: [
    'data'
  ],

  methods: [
    function initE() {
      this.SUPER();
      var name = "";

      this
        .start('p')
          .add('File Name')
        .end()
        .start('input')
          .attrs({
            name: 'fileName'
          })
        .end()
        .br()
        .br()
        .start('p')
          .add('Text')
        .end()
        .start('input')
          .on('blur', this.onBlur)
        .end();
    }
  ],

  listeners: [
    function onBlur(e) {
      let text = e.target.value;
      let blob = new Blob([text], {
          type: 'text/plain'
      });
      let name = document.getElementsByName('fileName');
      this.data = this.File.create({
        filename: name,
        filesize: blob.size,
        mimeType: 'text',
        data: this.BlobBlob.create({
          blob: blob
        })
      });
    }
  ]
})
