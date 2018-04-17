/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.net.nap.web',
  name: 'Messageboard',
  extends: 'foam.u2.Controller',

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
      factory: function(){
        return new Date();
      },
      javaFactory: 'return new java.util.Date();'
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
          .start(this.SAVE_MESSAGE).end()
          .start(this.UPLOAD_BUTTON, { showLabel:true })


        .end();

    }
  ],

  actions: [
    {
      name: 'saveMessage',
      label: 'Save',
      code: function(X) {
        var self = this;
        //alert(foam.demos.net.nap.web.Messageboard);

        // if (!this.data.amount || this.data.amount < 0){
        //   this.add(foam.u2.dialog.NotificationMessage.create({ message: 'Please Enter Amount.', type: 'error' }));
        //   return;
        // }

        var message = this.Messageboard.create({
          title: this.title,
          content: this.content
        });

        X.dao.put(message);

        //X.stack.push({class: 'net.nanopay.invoice.ui.SalesView'});
      }
    },
    {
      name: 'uploadButton',
      label: 'Choose File',

      code: function(X) {
        X.ctrl.add(foam.u2.dialog.Popup.create(undefined, X).tag({class: 'net.nanopay.ui.modal.UploadModal', exportData$: this.data$}));
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
