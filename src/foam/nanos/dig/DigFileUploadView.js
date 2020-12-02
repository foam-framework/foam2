/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'DigFileUploadView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.blob.BlobBlob',
    'foam.log.LogLevel',
    'foam.nanos.fs.File',
    'foam.nanos.notification.Notification',
    'foam.nanos.notification.ToastState',
    'foam.u2.tag.Input'
  ],

  imports: [
    'user',
    'blobService',
    'notify'
  ],

  exports: [
    'as data'
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
    ^ .attachment-filename {
      max-width: 342px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      float: left;
    }
    ^ .attachment-view {
      min-width: 700px;
      max-width: 275px;
      height: 40px;
      background-color: #ffffff;
      padding-left: 10px;
      padding-right: 10px;
      padding-top: 5px;
    }
    ^ .attachment-btn {
      margin: 10px 0;
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
    ^ .uploadDescContainer{
      position: relative;
      left: 26%;
      bottom: 24%;
    }
    ^ .uploadDescription {
      margin-top: 9px;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      color: /*%PRIMARY3%*/ #406dea;
    }
    ^ .boxless-for-drag-drop {
      border: dashed 4px #a4b3b8;
      width: 90%;
      height: 50px;
      padding: 10px 10px;
      position: relative;
      margin-bottom: 10px;
      margin-left: 5px;
      overflow: scroll;
    }
    ^ .attachment-footer {
      float: right;
    }
  `,

  properties: [
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'data'
    },
    {
      class: 'Boolean',
      name: 'dragActive',
      value: false
    },
    {
      class: 'String',
      name: 'acceptFormat',
      value: 'application/vnd.ms-excel, text/csv'
    },
    [ 'uploadHidden', false ],
    [ 'removeHidden', false ],
    [ 'boxHidden', false ],
    [ 'attachmentInputValue', null ]
  ],

  messages: [
    { name: 'UploadFileLabel', message: 'Choose File' },
    { name: 'RemoveImageLabel', message: 'Remove File' },
    { name: 'FileError', message: 'File required' },
    { name: 'FileTypeError', message: 'Wrong file format' },
    { name: 'ErrorMessage', message: 'Please upload an image less than 2MB' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start().addClass('attachment-btn').addClass('white-blue-button').addClass('btn')
          .add(this.UploadFileLabel)
          .on('click', this.onAddAttachmentClicked)
        .end()
        .start('div').addClass('boxless-for-drag-drop')
          .add(this.slot(function(data) {
            var e = this.E();

            if ( data ) {
              e.start('div').addClass('attachment-view')
                .start().addClass('attachment-filename')
                  .start('a')
                    .attrs({
                      href: this.data$.map(function(data) {
                        if ( data ) {
                          var blob = data.data;

                          if ( self.BlobBlob.isInstance(blob) ) {
                            return URL.createObjectURL(blob.blob);
                          } else {
                            var url = '/service/httpFileService/' + data.id;
                            return url;
                          }
                        }
                      }),
                      target: '_self'
                    }) //attrs
                   .add(this.slot(function (filename) {
                      var len = filename.length;

                     return ( len > 35 ) ? (filename.substr(0, 20) +
                       '...' + filename.substr(len - 10, len)) : filename;
                   }, data.filename$))
                .end()
            .end()
            .start().addClass('attachment-footer')
             .start({ class: 'foam.u2.tag.Image', data: 'images/ic-delete.svg'}).hide(this.removeHidden).end()
             .on('click', function(e) {
               self.document.querySelector('.attachment-view').remove()
               self.data = null;
             })
           .end()
           .end()
         }
         return e;
         }, this.data$))
          .on('dragstart', this.onDragStart)
          .on('dragenter', this.onDragEnter)
          .on('dragover', this.onDragOver)
          .on('drop', this.onDrop)
          .start().addClass('uploadButtonContainer').hide(this.uploadHidden)
            .start('input').addClass('attachment-input')
              .attrs({
                type: 'file',
                accept: this.acceptFormat
              })
              .on('change', this.onChange)
            .end()
          .end()
        .end()
    .end();
    }
  ],

  listeners: [
    function onAddAttachmentClicked(e) {
      this.document.querySelector('.attachment-input').click();
    },

    function onRemoveClicked(e) {
      this.dragActive = false;
      this.data = null;
      this.attachmentInputValue = null;
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
          if ( this.isFileType(file) )
            this.addFile(file);
          else
            this.notify(this.FileTypeError, '', this.LogLevel.ERROR, true);
        }
      } else if ( e.dataTransfer.files ) {
        var file = e.dataTransfer.files[0];
        if ( this.isFileType(file) )
          this.addFile(file);
        else
          this.notify(this.FileTypeError, '', this.LogLevel.ERROR, true);
      }
    },

    function isFileType(file) {
      if ( file.type === "application/vnd.ms-excel" || file.type === "text/csv" ) return true;

      return false;
    },

    function onChange(e) {
      this.dragActive = false;
      var file = e.target.files[0];
      this.addFile(file);
    },

    function addFile(file) {
      if ( file.size > ( 2 * 1024 * 1024 ) ) {
        this.notify(this.ErrorMessage, '', this.LogLevel.ERROR, true);
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
