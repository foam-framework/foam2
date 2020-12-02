/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'TextSaveView',
  extends: 'foam.u2.Controller',

  documentation: 'view to save plain text as file',

  requires: [
    'foam.blob.BlobBlob',
    'foam.nanos.fs.File'
  ],

  properties: [
    'data',
    {
      name: 'fileName'
    },
    {
      name: 'text',
      postSet: function(_, n) {
         let blob = new Blob([n], {
             type: 'text/plain'
         });
         this.data = this.File.create({
           filename: this.fileName,
           filesize: blob.size,
           mimeType: 'text',
           data: this.BlobBlob.create({
             blob: blob
           })
         });
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .start('p')
          .add('File Name')
        .end()
        .add(this.FILE_NAME)
        .br()
        .br()
        .start('p')
          .add('Text')
        .end()
        .add(this.TEXT)
    }
  ],

  listeners: [
    function onBlur(e) {
      let text = e.target.value;
      let blob = new Blob([text], {
          type: 'text/plain'
      });
      this.data = this.File.create({
        filename: this.fileName,
        filesize: blob.size,
        mimeType: 'text',
        data: this.BlobBlob.create({
          blob: blob
        })
      });
    }
  ]
})
