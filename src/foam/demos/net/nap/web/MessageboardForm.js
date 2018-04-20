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
    'foam.demos.net.nap.web.model.Messageboard'
  ],

  imports: [
    'messageboard',
    'messageboardDAO',
    'stack'
  ],

  documentation: '',

  tableColumns: [
    'title', 'createDate', 'creator'
  ],

  properties: [
    // {
    //   class: 'String',
    //   name: 'query',
    //   view: {
    //     class: 'foam.u2.TextField',
    //     type: 'Permission Search',
    //     placeholder: 'Permission',
    //     onKey: true
    //   }
    // },
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
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.addClass(this.myClass())
        .start('table')
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
            .start('td').add(this.BACK_ACTION).end()
            .start('td').add(this.SAVE_ACTION).end()
          .end()
          //.start().add(this.UPLOAD_BUTTON, { showLabel:true }).end()


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
          title: self.title,
          content: self.content,
          creator : self.creator,
          createdDate : self.createdDate
        });

        this.messageboardDAO.put(message).then(function(message) {
          self.message = message;
          X.stack.push({ class: 'foam.demos.net.nap.web.MessageboardForm' });
        });
      }
    },
    {
      name: 'uploadButton',
      label: 'Choose File',

      code: function(X) {
        X.ctrl.add(foam.u2.dialog.Popup.create(undefined, X).tag({class: 'net.nanopay.ui.modal.UploadModal', exportData$: this.data$}));
      }
    },
    {
      name: 'backAction',
      label: 'Back',
      code: function(X){
        X.stack.push({ class: 'foam.demos.net.nap.web.MessageboardList' });
      }
    }
  ]
  //,

  // methods: [
  //   {
  //     name: 'generateNanoInvoice',
  //       javaReturns: 'net.nanopay.invoice.model.Invoice',
  //       javaCode: `
  //         DAO invoiceDAO = (DAO) getX().get("invoiceDAO");
  //
  //         Invoice inv = new Invoice();
  //         inv.setX(getX());
  //
  //         inv.setInvoiceNumber(getInvoiceNum());
  //         inv.setPurchaseOrder("" + getId());
  //         inv.setIssueDate(getDate());
  //         inv.setDueDate(getDueDate());
  //         inv.setPaymentDate(getDatePaid());
  //         inv.setDraft(false);
  //         inv.setNote(getNotes());
  //         inv.setAmount(getTotal());
  //         inv.setCurrencyCode(getCurrencyCode());
  //         inv.setStatus(getStatus());
  //         inv.setPayeeId(2);
  //         inv.setPayerId(getUserId());
  //         invoiceDAO.put(inv);
  //         return inv;
  //         `
  //     }
  // ]

});
