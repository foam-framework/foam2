/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.demos.net.nap.web',
  name: 'MessageboardList',
  extends: 'foam.u2.Controller',

  documentation: 'Messageboard List',

  // implements: [
  //   'foam.mlang.Expressions'
  // ],

  requires: [
    'foam.demos.net.nap.web.model.Messageboard'
  ],

  imports: [
     'stack',
     'messageboardDAO',
     'messageboard'
  ],

  exports: [
    'dblclick'
  ],

  css: `
    ^ {
      width: 1240px;
      margin: 0 auto;
    }
    ^ .inline-float-right {
      float: right;
      display: inline-block;
    }
    ^ .button-div{
      margin-bottom: 10px;
    }
    ^ .net-nanopay-ui-ActionView-create{
      margin-right: 10px;
    }
    ^ table {
      width: 1240px;
    }
    ^ .foam-u2-view-TableView-row {
      height: 40px;
    }
    ^ .table-attachment {
      width: 20px;
      height: 20px;
      float: left;
      padding: 10px 0 0 10px;
    }
    ^ h3{
      width: 150px;
      display: inline-block;
      font-size: 14px;
      line-height: 1;
      font-weight: 500;
      text-align: center;
      color: #093649;
    }

  `,

  properties: [
    {
      name: 'data',
      factory: function() { return this.messageboardDAO; },
      view: {
        class: 'foam.u2.view.ScrollTableView',
        columns: [
          'id', 'title', 'creator', 'createdDate'
        ]
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .start()
            .start().addClass('button-div')
              .start(this.CREATE).end()
              //.start().add('Create').on('click', this.onCreate).end()
            .end()
          .end()
          .start()
            .add(this.DATA)
          .end()
         .end();
    },
    function dblclick(messageboard) {
      this.onEdit(messageboard);
    }
  ],

  actions: [
    {
      name: 'create',
      label: 'Create',
      code: function(X) {
        var self = this;

        self.stack.push({ class: 'foam.demos.net.nap.web.MessageboardForm' });
      }
    }
  ],

  listeners: [
    function onEdit(messageboard) {
      this.stack.push({
        class: 'foam.demos.net.nap.web.EditMessageboard',
        data: messageboard
      }, this);
    },

    {
      name: 'onAttachmentButtonClick',
      code: function (e) {
        var p = this.PopupView.create({
          minWidth: 175,
          width: 275,
          padding: 0.1,
          x: 0.1,
          y: 20
        });

        p.addClass('dropdown-content')
        .call(function () {
          var files = this.data.messageboardFile;
          for ( var i = 0 ; i < files.length ; i++ ) {
            p.tag({
              class: 'net.nanopay.invoice.ui.InvoiceFileView',
              data: files[i],
              fileNumber: i + 1,
              removeHidden: true
            })
          }
        }.bind(this));

        this.popupMenu_.add(p);
      }
    }
 ]
});
