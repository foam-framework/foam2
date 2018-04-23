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
    'foam.demos.net.nap.web.model.Messageboard',
    'foam.nanos.fs.File',
  ],

  imports: [
    'messageboard',
    'messageboardDAO',
    'stack'
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
      name: 'data'
    }
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
            .start('td').add(this.CREATOR).end()
          .end()
          .start('tr')
            .start('td').add('Content').end()
            .start('td').add(this.CONTENT).end()
          .end()
          .start('tr')
            .start('td').add('Attachments').end()
            // .start('td').add(this.slot(function (data) {
            //   var e = this.E();
            //   for ( var i = 0 ; i < data.length ; i++ ) {
            //     e.tag({
            //       class: 'net.nanopay.invoice.ui.InvoiceFileView',
            //       data: data[i],
            //       fileNumber: i + 1,
            //     });
            //   }
            //   return e;
            // }, this.data$))
            // .start(this.UPLOAD_BUTTON, { showLabel:true }).end() //.addClass('attachment-btn white-blue-button btn').end()
            .start('td').addClass('attachment-btn white-blue-button btn')
              .add('Choose File')
              .on('click', this.onAddAttachmentClicked)
            .end()

          .end()
          //.start().add(this.UPLOAD_BUTTON, { showLabel:true }).end()
        .end()

        .end();

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
          creator : self.creator,
          createdDate : self.createdDate
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
    },
    {
      name: 'uploadButton',
      label: 'Choose File',

      code: function(X) {
        X.ctrl.add(foam.u2.dialog.Popup.create(undefined, X).tag({class: 'net.nanopay.ui.modal.UploadModal', exportData$: this.data$}));
      }
    }
  ],

  listeners: [
    function onAddAttachmentClicked (e) {
      this.document.querySelector('.attachment-input').click();
    }
  ]

});
