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
      display: inline-block;
      vertical-align: text-bottom;
      margin-left: 20px;
      vertical-align: top;
      margin-top: 5px;
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
      position: absolute;
      left: 132px;
      bottom: 9px;
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
      background:white;
      height: 110px;
      padding: 10px 10px;
      position: relative;
    }

    ^ .boxless-for-drag-drop {
      border: solid 4px white;
      background:white;
      height: 110px;
      padding: 10px 10px;
      position: relative;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'placeholderImage'
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'ProfilePictureImage'
    },
    {
      class: 'Boolean',
      name: 'dragActive',
      value: false
    },
    [ 'uploadHidden', false ],
    [ 'boxHidden', false ]
  ],

  messages: [
    { name: 'UploadImageLabel', message: 'Choose File' },
    { name: 'RemoveImageLabel', message: 'Remove File' },
    { name: 'UploadDesc', message: 'Or drag and drop an image here' },
    { name: 'UploadRestrict', message: '* jpg, jpeg, or png only, 2MB maximum, 100*100 72dpi recommanded' },
    { name: 'FileError', message: 'File required' },
    { name: 'FileTypeError', message: 'Wrong file format' },
    { name: 'ErrorMessage', message: 'Please upload an image less than 2MB' }
  ],

  methods: [
    function initE() {
      var self = this;
      this
        .addClass(this.myClass())
        .start('div').addClass((this.boxHidden)?'boxless-for-drag-drop' :this.dragActive$.map(function (drag) {
          return drag ? 'box-for-drag-drop' : 'boxless-for-drag-drop';
        }))
          .add(this.slot(function (ProfilePictureImage) {
            return this.E('img').addClass('shopperImage')
            .attrs({
              src: this.ProfilePictureImage$.map(function (ProfilePictureImage) {
                if ( ProfilePictureImage && ProfilePictureImage.data ) {
                  var blob = ProfilePictureImage.data;
                  var sessionId = localStorage['defaultSession'];
                  if ( self.BlobBlob.isInstance(blob) )
                    return URL.createObjectURL(blob.blob);

                  var url = '/service/httpFileService/' + ProfilePictureImage.id;
                  // attach session id if available
                  if ( sessionId )
                    url += '?sessionId=' + sessionId;
                  return url;
                }

                return self.placeholderImage;
              })
            });
          }, this.ProfilePictureImage$))
          .on('dragstart', this.onDragStart)
          .on('dragenter', this.onDragEnter)
          .on('dragover', this.onDragOver)
          .on('drop', this.onDrop)
          .start().addClass('uploadButtonContainer').hide(this.uploadHidden)
            .start('input').addClass('attachment-input')
              .attrs({
                type: 'file',
                accept: 'image/jpg,image/gif,image/jpeg,image/bmp,image/png'
              })
              .on('change', this.onChange)
            .end()
            .start().addClass('attachment-btn').addClass('white-blue-button').addClass('btn')
              .add(this.UploadImageLabel)
              .on('click', this.onAddAttachmentClicked)
            .end()
          .end()
          .start().addClass('removeButtonContainer').show( !(this.uploadHidden) && this.ProfilePictureImage$.map(function (ProfilePictureImage) {
              return ProfilePictureImage;
            }))
            .start().addClass('attachment-btn').addClass('grey-button').addClass('btn')
              .add(this.RemoveImageLabel)
              .on('click', this.onRemoveClicked)
            .end()
          .end()
          .start().addClass('uploadDescContainer').hide(this.uploadHidden)
            .start().add(this.UploadDesc).addClass('uploadDescription').end()
            .start().add(this.UploadRestrict).addClass('uploadRestriction').end()
          .end()
        .end();
    }
  ],

  listeners: [
    function onAddAttachmentClicked (e) {
      this.document.querySelector('.attachment-input').click();
    },

    function onRemoveClicked (e) {
      this.dragActive = false;
      this.ProfilePictureImage= null;
    },

    function onDragOver(e) {
      this.dragActive = true;
      e.preventDefault();
    },

    function onDrop(e) {
      e.preventDefault();
      this.dragActive = false;
      if ( this.uploadHidden ) return;

      var inputFile;
      if ( e.dataTransfer.items ) {
        inputFile = e.dataTransfer.items[0]
        if ( inputFile.kind === 'file' ) {
          var file = inputFile.getAsFile();
          if ( this.isImageType(file) )
            this.addFile(file);
          else
            this.add(this.NotificationMessage.create({message: this.FileTypeError, type: 'error'}));
        }
      } else if ( e.dataTransfer.files ) {
        var file = e.dataTransfer.files[0];
        if ( this.isImageType(file) )
          this.addFile(file);
        else
          this.add(this.NotificationMessage.create({message: this.FileTypeError, type: 'error'}));
      }
    },

    function isImageType(file) {
      return file.type === "image/jpg" || file.type === "image/jpeg" || file.type === "image/png";
    },

    function onChange (e) {
      this.dragActive = false;
      var file = e.target.files[0];
      this.addFile(file);
    },

    function addFile (file) {
      if ( file.size > ( 2 * 1024 * 1024 ) ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorMessage, type: 'error' }));
        return;
      }
      this.ProfilePictureImage= this.File.create({
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
