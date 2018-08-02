/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.demos.net.nap.web',
  name: 'EditRegulatoryNotice',
  extends: 'foam.u2.View',

  documentation: 'Edit RegulatoryNotice Form',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.blob.BlobBlob',
    'foam.nanos.fs.File',
    'foam.demos.net.nap.web.model.RegulatoryNotice',
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'blobService',
    'regulatoryNotice',
    'regulatoryNoticeDAO',
    'stack',
    'user'
  ],

  exports: [
    'as view',
    'onFileRemoved'
  ],

  css: `
    ^{
      width: 100%;
      margin: auto;
      background-color: #edf0f5;
    }
    ^ .net-nanopay-ui-ActionView-backAction {
      border-radius: 2px;
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      margin-right: 10px;
    }
    ^ .actions {
      width: 1240px;
      height: 40px;
      margin: 0 auto;
    }
    ^ .left-actions {
      display: inline-block;
      float: left;
    }
    ^ .net-nanopay-ui-ActionView-saveAction {
      float: right;
      border-radius: 2px;
      background-color: %SECONDARYCOLOR%;
      margin-bottom: 10px;
      width: 140px;
      height: 40px;
      background-color: #59a5d5;
      font-family: Roboto;
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 2.86;
      letter-spacing: 0.2px;
      text-align: center;
      color: #ffffff;
    }
    ^ .net-nanopay-ui-ActionView-backAction {
      border-radius: 2px;
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
    }
    ^ .net-nanopay-ui-ActionView-backAction:hover {
      background: lightgray;
    }
    ^ .attachment-btn {
      margin-left: 5px;
      margin-bottom: 10px;
      margin-top: 10px;
    }
    ^ .attachment-input {
      width: 0.1px;
      height: 0.1px;
      opacity: 0;
      overflow: hidden;
      position: absolute;
      z-index: -1;
    }
    ^ .box-for-drag-drop {
      margin: 20px;
      border: dashed 4px #edf0f5;
      height: 100px;
      width: 560px;
      overflow: scroll;
    }
    ^ .boxless-for-drag-drop {
      border: dashed 4px #a4b3b8;
      width: 97%;
      height: 110px;
      padding: 10px 10px;
      position: relative;
      margin-bottom: 10px;
      margin-left: 5px;
      overflow: scroll;
    }
    ^ .tableView {
      ackground: #fafafa;
      border: 1px solid grey;
    }
    ^ .foam-u2-PropertyView-label {
      color: #444;
      display: block;
      float: left;
      font-size: 13px;
      padding: 4px 8px 4px 8px;
      text-align: left;
      vertical-align: top;
      white-space: nowrap;
    }
    ^ .foam-u2-PropertyView {
      padding: 2px 8px 2px 6px;
    }
    ^ .net-nanopay-ui-ActionView-delete {
      float: right;
      margin-left: 10px;
    }
    ^ .net-nanopay-ui-ActionView-delete {
      background: #d55;
      color: white;
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
    ^ .attachment-number {
      float: left;
      width: 21px;
      height: 20px;
      font-size: 12px;
      line-height: 1.67;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      margin-right: 10px;
    }
    ^ .attachment-filename {
      max-width: 342px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      float: left;
    }
    ^ .attachment-filename a {
      height: 16px;
      font-size: 12px;
      line-height: 1.66;
      letter-spacing: 0.2px;
      text-align: left;
      color: #59a5d5;
      padding-left: 12px;
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
    ^ .attachment-footer {
      float: right;
    }
    ^ .attachment-filesize {
      width: 16.7px;
      height: 8px;
      font-size: 6px;
      line-height: 1.33;
      letter-spacing: 0.1px;
      text-align: left;
      color: #a4b3b8;
      padding-top: 6px;
    }

  `,

  properties: [
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'data_',
      value: this.exportData
    },
    'exportData',
    {
      class: 'Boolean',
      name: 'dragActive',
      value: false
    },
    [ 'uploadHidden', false ],
    [ 'removeHidden', false ]
  ],

  messages: [
    { name: 'UploadDesc', message: 'Or drag and drop an image here' },
    { name: 'UploadRestrict', message: '* jpg, jpeg, or png only, 2MB maximum, 100*100 72dpi recommanded' },
    { name: 'FileError', message: 'File required' },
    { name: 'FileTypeError', message: 'Wrong file format' },
    { name: 'ErrorMessage', message: 'Please upload an image less than 2MB' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      var userId = this.user.id;
      var userName = this.user.firstName;
      var regulatoryNoticeObj = this.data;
      this.data_ = Array.from(regulatoryNoticeObj.data);

      this
        .addClass(this.myClass())
        .start().addClass('actions')
          .start().addClass('left-actions')
            .start(this.BACK_ACTION).end()
            .start(this.DELETE).addClass('net-nanopay-ui-ActionView-delete').end()
            .start().add('SAVE').addClass('net-nanopay-ui-ActionView-saveAction').on('click', this.onSave).end()
          .end()
            .start('table').addClass('tableView')
              .start('tr')
                .start('td').addClass('foam-u2-PropertyView-label').add('Id').end()
                .start('td').addClass('foam-u2-PropertyView').add(this.data.ID).end()
              .end()
              .start('tr')
                .start('td').addClass('foam-u2-PropertyView-label').add('Starmark').end()
                .start('td').addClass('foam-u2-PropertyView').tag(this.data.STARMARK).end()
              .end()
              .start('tr')
                .start('td').addClass('foam-u2-PropertyView-label').add('Title').end()
                .start('td').addClass('foam-u2-PropertyView').add(this.data.TITLE).end()
              .end()
              .start('tr')
                .start('td').addClass('foam-u2-PropertyView-label').add('Date').end()
                .start('td').addClass('foam-u2-PropertyView').add(this.data.CREATED_DATE).end()
              .end()
              .start('tr')
                .start('td').addClass('foam-u2-PropertyView-label').add('Creator').end()
                .start('td').addClass('foam-u2-PropertyView').add(userName).end()
              .end()
              .start('tr')
                .start('td').addClass('foam-u2-PropertyView-label').add('Hits').end()
                .start('td').addClass('foam-u2-PropertyView').add(this.data.HITS).end()
              .end()
              .start('tr')
                .start('td').addClass('foam-u2-PropertyView-label').add('Content').end()
                .start('td').addClass('foam-u2-PropertyView').add(this.data.CONTENT).end()
              .end()
              .start('tr')
                .start('td').addClass('foam-u2-PropertyView-label').add('Attachments').end()
                .start('td')

                .start().addClass('attachment-btn').addClass('white-blue-button').addClass('btn')
                  .add('Choose File')
                  .on('click', this.onAddAttachmentClicked)
                .end()
                .start('div').addClass('boxless-for-drag-drop')
                  .add(this.slot(function (data_) {
                    var e = this.E();
                    for ( var i = 0 ; i < data_.length ; i++ ) {
                      var fileData = data_.data;
                        e.start('div').addClass('attachment-view').setID(i+1)
                        .start().addClass('attachment-filename')
                          .start('a')
                            .attrs({
                              href: this.data_$.map(function (fileData) {
                                if ( fileData[i] ) {
                                    var blob = fileData[i].data;
                                    var sessionId = localStorage['defaultSession'];

                                    if ( self.BlobBlob.isInstance(blob) ) {
                                      return URL.createObjectURL(blob.blob);
                                    } else {
                                      var url = '/service/httpFileService/' + fileData[i].id;

                                      // attach session id if available
                                      if ( sessionId ) {
                                        url += '?sessionId=' + sessionId;
                                      }
                                      return url;
                                    }
                                }
                             }),
                             target: '_blank'
                           })  //attrs
                           .add(this.slot(function (filename) {
                             var len = filename.length;
                             return ( len > 35 ) ? (filename.substr(0, 20) +
                               '...' + filename.substr(len - 10, len)) : filename;
                           }, this.data_[i].filename$))
                        .end()
                     .end()
                     .start().addClass('attachment-footer').setID(i+1)
                       .start({ class: 'foam.u2.tag.Image', data: 'images/ic-delete.svg'}).hide(this.removeHidden).end()
                       .on('click', function(e) {
                         console
                         self.data_.splice(this.id - 1, 1);
                         this.remove();
                         self.data_ = Array.from(self.data_);
                       })
                     .end()
                     .end()
                    }
                    return e;
                  }, this.data.data$))
                  .on('dragstart', this.onDragStart)
                  .on('dragenter', this.onDragEnter)
                  .on('dragover', this.onDragOver)
                  .on('drop', this.onDrop)
                  .start().addClass('uploadButtonContainer').hide(this.uploadHidden)
                    .start('input').addClass('attachment-input')
                      .attrs({
                        type: 'file',
                        accept: 'image/jpg,image/gif,image/jpeg,image/bmp,image/png,application/msword,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.presentationml.slideshow,application/vnd.oasis.opendocument.text,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                      })
                      .on('change', this.onChange)
                    .end()
                  .end()
              .end()
              .end()

            .end()
            .end();
    }
  ],

  actions: [
    {
      name: 'backAction',
      label: 'Back',
      code: function(X){
        X.stack.back();
      }
    },
    {
      name: 'delete',
      label: 'Delete',
      confirmationRequired: true,
      code: function(X){
        var self = this;

        X.regulatoryNoticeDAO.remove(this).then(function() {
          X.stack.back();
        });
      }
    }
  ],

  listeners: [
    function onAddAttachmentClicked (e) {
      this.document.querySelector('.attachment-input').click();
    },

    function onFileRemoved (data) {
      console.log(data.querySelector('.attachment-number'));
    },

    function onRemoveClicked (e) {
      this.dragActive = false;
      this.data = null;
    },

    function onChange (e) {
      this.dragActive = false;
      var files = e.target.files;
      this.addFiles(files)
    },

    function onDragOver(e) {
      this.dragActive = true;
      e.preventDefault();
    },

    function onDrop(e) {
      e.preventDefault();
      var files = [];
      var inputFile;
      if ( e.dataTransfer.items ) {
        inputFile = e.dataTransfer.items
        if ( inputFile ) {
          for ( var i = 0; i < inputFile.length; i++ ) {
            // If dropped items aren't files, reject them
            if ( inputFile[i].kind === 'file' ) {
              var file = inputFile[i].getAsFile();
              if( this.isFileType(file) ) files.push(file);
              else
                this.add(this.NotificationMessage.create({ message: this.FileTypeError, type: 'error' }));
            }
          }
        }
      } else if( e.dataTransfer.files ) {
        inputFile = e.dataTransfer.files
        for (var i = 0; i < inputFile.length; i++) {
          var file = inputFile[i];
          if( this.isFileType(file) ) files.push(file);
          else{
            this.add(this.NotificationMessage.create({ message: this.FileTypeError, type: 'error' }));
          }
        }
      }
      this.addFiles(files)
    },

    function isFileType(file) {
      if ( file.type === "image/jpg"  ||
           file.type === "image/jpeg" ||
           file.type === "image/gif"  ||
           file.type === "image/bmp"  ||
           file.type === "image/png"  ||
           file.type === "application/msword" ||
           file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
           file.type === "application/vnd.ms-powerpoint" ||
           file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
           file.type === "application/vnd.openxmlformats-officedocument.presentationml.slideshow" ||
           file.type === "application/vnd.oasis.opendocument.text" ||
           file.type === "application/vnd.ms-excel" ||
           file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
           file.type === "application/pdf"
        )
        return true;
      return false;
    },

    function addFiles(files){
      var errors = false;
      for ( var i = 0 ; i < files.length ; i++ ) {
        // skip files that exceed limit
        if ( files[i].size > ( 10 * 1024 * 1024 ) ) {
          if ( ! errors ) errors = true;
          this.add(this.NotificationMessage.create({ message: this.ErrorMessage, type: 'error' }));
          continue;
        }
        var isIncluded = false
        for ( var j = 0 ; j < this.data_.length ; j++ ) {
          if( this.data_[j].filename.localeCompare(files[i].name) === 0 ) {
            isIncluded = true;
            break
          }
        }
        if ( isIncluded ) continue ;
        this.data_.push(this.File.create({
          owner: this.user.id,
          filename: files[i].name,
          filesize: files[i].size,
          mimeType: files[i].type,
          data: this.BlobBlob.create({
            blob: files[i]
          })
        }))
      }
      this.data.data = Array.from(this.data_);
      this.exportData = this.data_;
    },

    function onSave(X) {
      var self = this;

      if ( this.data.title == null || this.data.title == '' ) {
        this.add(foam.u2.dialog.NotificationMessage.create({ message: 'Please Enter Title.', type: 'error' }));
        return;
      }

      if ( this.data.content == null || this.data.content == '' ) {
        this.add(foam.u2.dialog.NotificationMessage.create({ message: 'Please Enter Content.', type: 'error' }));
        return;
      }

      var message = self.RegulatoryNotice.create({
        id : this.data.id,
        starmark : this.data.starmark,
        title: this.data.title,
        content: this.data.content,
        creator : this.data.creator,
        createdDate : this.data.createdDate,
        data : Array.from(this.data_)
      });

      this.regulatoryNoticeDAO.put(message).then(function() {
        self.stack.push({ class: 'foam.demos.net.nap.web.RegulatoryNoticeList' });
      });
    }
  ]

});
