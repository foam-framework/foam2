/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.support.view',
  name: 'CreateTicketView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.support.model.Ticket',
    'foam.support.model.TicketMessage',
    'foam.u2.PopupView',
    'foam.log.LogLevel'
  ],

  imports: [
    'ctrl',
    'notify',
    'ticketDAO',
    'user',
    'hideSummary',
    'stack'
  ],

  exports: [
    'as data',
    'submitAsPopUp'
  ],

  css: `
    ^ {
      box-sizing: border-box;
    }
    ^ .actions {
      width: 970px;
      height: 40px;
      margin: 0 auto;
      padding: 20px 0 20px 0;
    }
    ^ .left-actions {
      display: inline-block;
      float: left;
    }
    ^ .right-actions {
      display: inline-block;
      float: right;
    }
    ^ .foam-support-view-CreateTicketView {
      margin-top:20px;
    }
    ^ .div{
      margin-top: 40px;
    }
    ^ .label{
      height: 16px;
      font-family: Roboto;
      font-size: 14px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      margin: 0px;
    }
    ^ .foam-u2-TextField {
      margin-bottom:20px;
      margin-top:8px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
    }
    ^ .foam-u2-tag-TextArea {
      margin-top:8px;
    }
    ^ .property-requestorEmail,.property-requestorName{
      width: 450px;
      height: 40px;
    }
    ^ .property-message{
      width: 940px;
      height: 240px;
      border: 1px solid lightgrey;
    }
    ^ .property-subject{
      width: 940px;
      height: 40px;
    }
    ^ .New-Ticket {
      margin-top:30px;
      width: 186px;
      height: 20px;
      opacity: 0.6;
      font-family: Roboto;
      font-size: 20px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      line-height: 1;
      letter-spacing: 0.3px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .bg2 {
      margin-top:20px;
      border-radius: 2px;
      background-color: #ffffff;
      padding: 20px;
    }
    ^ .popUpDropDown {
      padding: 0 !important;
      width: 165px;
      background: #ffffff;
      z-index: 10000;
      box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.19);
    }
    ^ .popUpDropDown > div > div {
      padding: 8px 0 0 11px;
      box-sizing:border-box;
      width: 165px;
      height: 35px;
      z-index: 10000
      font-family: Roboto;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.33;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .popUpDropDown > div > div:hover {
      background-color: rgba(89, 165, 213, 0.3);
    }
    ^ .status{
      color: white;
      display: inline-block;
      text-align: center;
      font-size: 10px;
      line-height: 20px;
    }
    ^ .Submit-as{
      float: left;
      margin-top:2px;
      margin-right:10px;
    }
    ^ .rname {
      margin-right:20px;
      float:left;
    }
  `,

  properties: [
    'submitAsMenuBtn_',
    'submitAsPopUp',
    {
      name: 'dao',
      factory: function() { return this.user.tickets; }
    },
    {
      class: 'String',
      name: 'requestorEmail'
    },
    {
      class: 'String',
      name: 'requestorName'
    },
    {
      class: 'String',
      name: 'subject'
    },
    {
      class: 'String',
      name: 'message',
      view: 'foam.u2.tag.TextArea'
    },
    {
      class: 'String',
      name: 'status',
      value: 'New'
    },
    {
      class: 'Int',
      name: 'ticketCount',
      value: '...'
    }
  ],

  methods: [
    function initE() {
      this.hideSummary = true;

      this.dao.on.sub(this.onDAOUpdate);
      this.onDAOUpdate();

      this
        .addClass(this.myClass())
        .start().addClass('actions')
          .start().addClass('left-actions')
            .start(this.DELETE_DRAFT).end()
          .end()
          .start().addClass('right-actions')
            .start(this.SUBMIT_AS_DROP_DOWN, null, this.submitAsMenuBtn_$).end()
            .start(this.SUBMIT_AS, {
              label: this.slot(function (status) {
                return 'Submit as ' + status;
              }, this.status$)
            }).end()
          .end()
        .end()

        .start().addClass('New-ticket').add('New Ticket #', this.ticketCount$).end()

        .start().addClass('bg2')
        .start()
          .start().addClass('rname')
            .start().addClass('label')
              .add('Requestor Name')
            .end()
            .start()
              .tag(this.REQUESTOR_NAME)
            .end()
          .end()
          .start().addClass('remail')
            .start().addClass('label')
              .add('Requestor Email (optional)')
            .end()
            .start()
              .tag(this.REQUESTOR_EMAIL)
            .end()
          .end()
        .end()
          .start().addClass('label')
            .add('Subject')
          .end()
          .start()
            .tag(this.SUBJECT)
          .end()
          .start().addClass('label')
            .add('Description')
          .end()
          .start()
            .tag(this.MESSAGE)
          .end()
        .end()
    }
  ],

  actions: [
    {
      name: 'deleteDraft',
      code: function(X) {
        this.hideSummary = false;
        X.stack.back();
      }
    },
    {
      name: 'submitAs',
      code: function (X) {
        var self = this;

        var ticket = this.Ticket.create({
          requestorEmail: this.requestorEmail,
          requestorName: this.requestorName,
          userId: this.user.id,
          subject: this.subject,
          status: this.status
        });

        this.dao.put(ticket).then(function(ticket) {
          if (self.message == "") return;
          var message = self.TicketMessage.create({
            senderId: self.user.id,
            dateCreated: new Date(),
            message: self.message,
            type: 'Internal'
          });
          ticket.messages.put(message).then(function(a) {
            self.notify('Ticket Created!', '', self.LogLevel.INFO, true);
          });
        });
        this.stack.push({ class: 'foam.support.view.TicketView' });
      }
    },
    {
      name: 'submitAsDropDown',
      label: '',
      code: function(X) {
        var self = this;
        if ( this.submitAsPopUp ) {
          this.submitAsPopUp = null;
          return;
        }

        // create popup view
        this.submitAsPopUp = foam.u2.PopupView.create({
          width: 165,
          x: -137,
          y: 40
        });

        // add items
        this.submitAsPopUp.addClass('popUpDropDown')
          .add(this.slot(function (status) {
            var statuses = ['New', 'Pending', 'Open', 'Updated', 'Solved'].filter(function (status) {
              return status !== self.status;
            });

            return this.E().forEach(statuses, function (status) {
              this
                .start('div')
                .start().add('Submit as').addClass('Submit-as').end()
                .start().addClass(status).addClass('status').add(status).end()
                .on('click', function () {
                  self.status = status;
                  self.submitAsPopUp.close();
                })
                .end();
            })
          }, this.status$));

        this.submitAsMenuBtn_.add(this.submitAsPopUp);
      }
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        var self = this;
        this.dao.select(this.COUNT()).then(function(count) {
          self.ticketCount = count.value + 1;
        });
      }
    }
  ]
});
