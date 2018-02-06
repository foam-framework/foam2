/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ProfilePictureView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.blob.BlobBlob',
    'foam.nanos.fs.File'
  ],

  imports: [
    'user',
    'blobService'
  ],

  exports: [
    'as data',
  ],

  css: `
    ^ .attachment-input {
      width: 0.1px;
      height: 0.1px;
      opacity: 0;
      overflow: hidden;
      position: absolute;
      z-index: -1;
    }
    ^ .attachment-btn {
      margin: 10px 0;
    }
    ^ .shopperImage {
      width: 80px;
      height: 80px;
      display: inline-block;
      border: solid 1px #a4b3b8;
      border-radius: 50%;
      object-fit: cover;
    }
    ^ .uploadButtonContainer {
      height: 80px;
      display: inline-block;
      vertical-align: text-bottom;
      margin-left: 40px;
    }
    ^ .net-nanopay-ui-ActionView-uploadImage {
      width: 136px;
      height: 40px;
      background: transparent;
      border: solid 1px #59a5d5;
      color: #59a5d5;
      margin: 0;
      outline: none;
    }
    ^ .uploadDescription {
      margin-top: 9px;
      font-size: 10px;
      font-weight: 300;
      letter-spacing: 0.2px;
      color: #093649;
    }
  `,

  properties: [
    {
      class: 'File',
      name: 'data'
    },
    [ 'uploadHidden', false ]
  ],

  messages: [
    { name: 'UploadImageLabel', message: 'Upload Image' },
    { name: 'UploadDesc', message: 'JPG, GIF, JPEG, BMP or PNG' },
  ],

  methods: [
    function initE() {
      var self = this;

      this
        .addClass(this.myClass())
        .add(this.slot(function (data) {
          return this.E('img').addClass('shopperImage')
            .attrs({
              src: this.data$.map(function (data) {
                if ( data && data.data ) {
                  var blob = data.data;
                  return self.BlobBlob.isInstance(blob) ?
                    URL.createObjectURL(blob.blob) :
                    ( "/service/httpFileService/" + data.id );
                } else {
                   return 'images/person.svg'
                }
              })
            });
        }, this.data$))
        .start().addClass('uploadButtonContainer').hide(this.uploadHidden)
          .start('input').addClass('attachment-input')
            .attrs({
              type: 'file',
              accept: 'image/jpg,image/gif,image/jpeg,image/bmp,image/png'
            })
            .on('change', this.onChange)
          .end()
          .start().addClass('attachment-btn white-blue-button btn')
            .add(this.UploadImageLabel)
            .on('click', this.onAddAttachmentClicked)
          .end()
          .start().add(this.UploadDesc).addClass('uploadDescription').end()
        .end()
    }
  ],

  listeners: [
    function onAddAttachmentClicked (e) {
      this.document.querySelector('.attachment-input').click();
    },

    function onChange (e) {
      var file = e.target.files[0];
      this.data = this.File.create({
        owner: this.user.id,
        filename: file.name,
        filesize: file.size,
        mimeType: file.type,
        data: this.BlobBlob.create({
          blob: file
        })
      });
    }
  ]
});
