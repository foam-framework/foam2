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
    'foam.nanos.fs.File',
    'foam.u2.dialog.NotificationMessage'
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
    ^ .removeButtonContainer {
      height: 80px;
      display: inline-block;
      vertical-align: text-bottom;
      margin-left: 20px;
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
    ^ .uploadDescContainer{
      display: inline-block;
      vertical-align: text-top;
      margin-left: -315px;
    }
    ^ .uploadDescription {
      margin-top: 9px;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      color: %SECONDARYCOLOR%;
    }
    ^ .uploadRestriction {
      margin-top: 9px;
      font-size: 10px;
      font-weight: 300;
      letter-spacing: 0.2px;
      color: #093649;
    }
    ^ .box-for-drag-drop {
      border: dashed 4px #edf0f5;
      width: 90%;
      height: 110px;
      padding: 10px 10px;
    }
  `,

  properties: [
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'data'
    },
    [ 'uploadHidden', false ]
  ],

  messages: [
    { name: 'UploadImageLabel', message: 'Choose File' },
    { name: 'RemoveImageLabel', message: 'Remove File' },

    { name: 'UploadDesc', message: 'Or drag and drop an image here' },
    { name: 'UploadRestrict', message: '* jpg, jpeg, or png only, 2MB maximum, 100*100 72dpi recommanded' },
    { name: 'FileError', message: 'File required' },    
    { name: 'FormatError', message: 'JPG, GIF, JPEG, BMP, PNG and PDF only accepted' },
    { name: 'ErrorMessage', message: 'Please upload an image less than 2MB' }
  ],

  methods: [
    function initE() {
      var self = this;

      this
        .addClass(this.myClass())
        .start('div').addClass('box-for-drag-drop')
          .add(this.slot(function (data) {
            return this.E('img').addClass('shopperImage')
              .attrs({
                src: this.data$.map(function (data) {
                  if ( data && data.data ) {
                    var blob = data.data;
                    var sessionId = localStorage['defaultSession'];
                    if ( self.BlobBlob.isInstance(blob) ) {
                      return URL.createObjectURL(blob.blob);
                    } else {
                      var url = '/service/httpFileService/' + data.id;
                      // attach session id if available
                      if ( sessionId ) {
                        url += '?sessionId=' + sessionId;
                      }
                      return url;
                    }
                  } else {
                    return 'images/person.svg'
                  }
                })
              });
          }, this.data$))
          .on('dragstart', this.onDragStart)
          .on('dragenter', this.onDragOver)
          .on('dragover', this.onDragOver)
          .on('drop', this.onDrop)
          .start().addClass('uploadButtonContainer')
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
          .end()
          .start().addClass('removeButtonContainer')
            .start().addClass('attachment-btn grey-button btn')
              .add(this.RemoveImageLabel)
              .on('click', this.onRemoveClicked)
            .end()
          .end()
          .start().addClass('uploadDescContainer')
            .start().add(this.UploadDesc).addClass('uploadDescription').end()
            .start().add(this.UploadRestrict).addClass('uploadRestriction').end()
          .end()
        .end()
    }
  ],

  listeners: [
    function onDragOver(e) {
      e.preventDefault();    
    },
    function onDrop(e) {
      e.preventDefault();  
      if (e.dataTransfer.items[0].kind === 'file') {
      }        
      var file = e.dataTransfer.items[0].getAsFile();
      
      if(file.type === "image/jpg" || file.type === "image/jpeg" || file.type === "image/png"){
      }              
      this.addFile(file);
    },
    function onAddAttachmentClicked (e) {
      this.document.querySelector('.attachment-input').click();
    },
    function onRemoveClicked (e) {
      //TODO:  Remove the profile picture
    },
    function onChange (e) {
      var file = e.target.files[0];
      this.addFile(file);
      
      
    },
    function addFile (file) {
      if ( file.size > ( 2 * 1024 * 1024 ) ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorMessage, type: 'error' }));
        return;
      }
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
