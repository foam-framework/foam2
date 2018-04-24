/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.net.nap.web',
  name: 'MessageboardForm',
  extends: 'foam.u2.Controller',

  requires: [
    'foam.blob.BlobBlob',
    'foam.demos.net.nap.web.model.Messageboard',
    'foam.nanos.fs.File',
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'messageboard',
    'messageboardDAO',
    'stack',
    'blobService',
    'onInvoiceFileRemoved',
    'user',
  ],

  exports: [
    'as data',
    'onInvoiceFileRemoved'
  ],

  documentation: 'New Messageboard Form',

  tableColumns: [
    'id', 'title', 'createDate', 'creator'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'title'
    },
    {
      class: 'String',
      name: 'content',
      view: { class: 'foam.u2.tag.TextArea', rows: 40, cols: 120}
    },
    {
      class: 'DateTime',
      name: 'createdDate',
      visibility: foam.u2.Visibility.RO,
      factory: function(){
        return new Date();
      }
      //javaFactory: 'return new java.util.Date();'
    },
    {
      class: 'String',
      name: 'creator'
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'data',
      value: this.exportData
    },
    'exportData',
    {
      class: 'Boolean',
      name: 'dragActive',
      value: false
    },
    'fileNumber',
    [ 'removeHidden', false ],
    [ 'uploadHidden', false ]
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
      color: white;
      margin-top: 10px;
    }
    ^ .net-nanopay-ui-ActionView-saveAction:hover {
      background: %SECONDARYCOLOR%;
      opacity: 0.9;
    }
    ^ .net-nanopay-ui-ActionView-backAction {
      border-radius: 2px;
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      margin-top: 10px;
    }
    ^ .net-nanopay-ui-ActionView-backAction:hover {
      background: lightgray;
    }
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
    ^ .net-nanopay-invoice-ui-InvoiceFileView {
      min-width: 175px;
      max-width: 275px;
      height: 40px;
      background-color: #ffffff;  //#EEF0F5;
      padding-left: 10px;
      padding-right: 10px;
      padding-top: 5px;
    }

  `,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.addClass(this.myClass())
        .start().addClass('actions')
          .start().addClass('left-actions')
            .start(this.BACK_ACTION).end()
            .start(this.SAVE_ACTION).end()
          .end()

          .start('table')
            .start('tr')
              .start('td').add('Id').end()
              .start('td').add(this.ID).end()
            .end()
            .start('tr')
              .start('td').add('Title').end()
              .start('td').add(this.TITLE).end()
            .end()
            .start('tr')
              .start('td').add('Date').end()
              .start('td').add(this.CREATED_DATE).end()
            .end()
            .start('tr')
              .start('td').add('Creator').end()
              .start('td').add(this.user.id).end()
            .end()
            .start('tr')
              .start('td').add('Content').end()
              .start('td').add(this.CONTENT).end()
            .end()
            .start('tr')
              .start('td').add('Attachments').end()
              .start('td')

              .start('div').addClass('box-for-drag-drop')
                 .add(this.slot(function (data) {
                   var e = this.E();
                   for ( var i = 0 ; i < data.length ; i++ ) {
                     e.tag({
                       class: 'net.nanopay.invoice.ui.InvoiceFileView',
                       data: data[i],
                       fileNumber: i + 1,
                     });
                   }
                   return e;
                  }, this.data$))






                .start('input').addClass('attachment-input')
                  .attrs({
                    type: 'file',
                    accept: 'image/jpg,image/gif,image/jpeg,image/bmp,image/png,application/msword,application/pdf'
                  })
                  .on('change', this.onChange)
                .end()

                .start().addClass('attachment-btn white-blue-button btn')
                  .add('Choose File')
                  .on('click', this.onAddAttachmentClicked)
                .end()

            .end()
          .end()
        .end();
    },
    function onInvoiceFileRemoved (fileNumber) {
      alert(fileNumber);
      this.document.querySelector('.attachment-input').value = null;
      this.data.splice(fileNumber - 1, 1);
      this.data = Array.from(this.data);
    }
  ],

  actions: [
    {
      name: 'saveAction',
      label: 'Save',
      code: function(X) {
        var self = this;
        //alert(foam.demos.net.nap.web.Messageboard);

        // if (!this.data.amount || this.data.amount < 0){
        //   this.add(foam.u2.dialog.NotificationMessage.create({ message: 'Please Enter Amount.', type: 'error' }));
        //   return;
        // }

        var message = self.Messageboard.create({
          id : self.id,
          title: self.title,
          content: self.content,
          creator : this.user.id,
          createdDate : self.createdDate,
          data : self.data
        });
        X.messageboardDAO.put(message).then(function() {
          X.stack.push({ class: 'foam.demos.net.nap.web.MessageboardList' });
        })
      }
    },
    {
      name: 'backAction',
      label: 'Back',
      code: function(X){
        X.stack.push({ class: 'foam.demos.net.nap.web.MessageboardList' });
      }
    }
  ],

  listeners: [
    function onAddAttachmentClicked () {
      this.document.querySelector('.attachment-input').click();
    },

    // function onChange (e) {
    //   this.dragActive = false;
    //   var file = e.target.files[0];
    //   this.addFile(file);
    // },

    function onChange (e) {
      var files = e.target.files;
      this.addFiles(files)
    },

    // function addFile (file) {
    //   if ( file.size > ( 2 * 1024 * 1024 ) ) {
    //     this.add(this.NotificationMessage.create({ message: this.ErrorMessage, type: 'error' }));
    //     return;
    //   }
    //   this.data = this.File.create({
    //     filename: file.name,
    //     filesize: file.size,
    //     mimeType: file.type,
    //     data: this.BlobBlob.create({
    //       blob: file
    //     })
    //   });
    // }

    function addFiles(files){
      var errors = false;
      for ( var i = 0 ; i < files.length ; i++ ) {
        // skip files that exceed limit
        if ( files[i].size > ( 10 * 1024 * 1024 ) ) {
          if ( ! errors ) errors = true;
          this.add(this.NotificationMessage.create({ message: this.FileSizeError, type: 'error' }));
          continue;
        }
        var isIncluded = false
        for ( var j = 0 ; j < this.data.length ; j++ ) {
          if( this.data[j].filename.localeCompare(files[i].name) === 0 ) {
            isIncluded = true;
            break
          }
        }
        if ( isIncluded ) continue ;
        this.data.push(this.File.create({
          filename: files[i].name,
          filesize: files[i].size,
          mimeType: files[i].type,
          data: this.BlobBlob.create({
            blob: files[i]
          })
        }))
      }
      this.data = Array.from(this.data);
    }
  ]

});
