/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.support.view',
  name: 'TicketDetailView',
  extends: 'foam.u2.View',

  documentation: 'Ticket Detail View',

  requires: [
    'foam.nanos.auth.User',
    'foam.u2.PopupView',
    'foam.support.model.TicketMessage',
    'foam.support.view.ReplyView',
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'stack',
    'userDAO',
    'hideSummary',
    'user'
  ],

  exports: [
    'as data',
    'viewData'
  ],

  css: `
    ^ {
      box-sizing: border-box;
    }
    ^ .actions {
      height: 40px;
      margin: 0 auto;
    }
    ^ .left-actions {
      display: inline-block;
      float: left;
    }
    ^ .right-actions {
      display: inline-block;
      float: right;
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
    ^ .Submit-as{
      float: left;
      margin-top:2px;
      margin-right:10px;
    }
    ^ .status {
      color: white;
      display: inline-block;
      text-align: center;
      padding-top: 4px;
      font-size: 10px;
    }
    ^ .header {
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      margin: 30px 0 20px 0;
    }
    ^ .title {
      width: auto;
      height: 20px;
      font-family: Roboto;
      font-size: 20px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      line-height: 1;
      letter-spacing: 0.3px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      float:left;
      display: inline-block;
      padding-right: 20px;
    }
    ^ .generic-status {
      line-height: 1.2;
      height: 14px;
    }
    ^ .subtitle {
      opacity: 0.7;
      font-family: Roboto;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.33;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      padding-top: 10px;
    }
  `,

  properties: [
    'name',
    'status',
    'messages',
    'submitAsMenuBtn_',
    'submitAsPopUp',
    {
      name: 'dao',
      factory: function () { return this.data.messages; }
    },
    {
     name:'boolDropDown',
     value: true
    },
    {
      name:'boolViewFollowUp',
      value: false
     },
    {
      name: 'viewData',
      value: {}
    }
  ],

  methods: [
    function initE(){
      var self = this;
      this.hideSummary = true;
      this.status = this.data.status;

      this.dao.on.sub(this.onDAOUpdate);
      this.onDAOUpdate();

      this
        .addClass(this.myClass())
        .start().addClass('actions')
          .start().addClass('left-actions')
            .start(this.BACK_ACTION).end()
          .end()
          .start().addClass('right-actions')
            .start().show(this.status$.map(function (a) { return a !== 'Solved'; }))
              .start(this.SUBMIT_AS_DROP_DOWN, null, this.submitAsMenuBtn_$).end()
              .start(this.SUBMIT_AS, {
                label: this.slot(function (status) {
                  return 'Submit as ' + status;
                }, this.data.status$)
              }).end()
            .end()
            .start().show(this.status$.map(function (a) { return a === 'Solved'; }))
              .start(this.FOLLOW_UP).end()
            .end()
          .end()
        .end()
        .start().addClass('header')
          .start()
            .start().addClass('title').add(this.data.subject + "...").end()
            .start().addClass('generic-status').addClass(this.status).add(this.status).end()
          .end()
          .start().addClass('subtitle')
            .add("#", this.data.id, ' ', this.formatDate(this.data.createdAt), ' | ', this.data.requestorName, " <", this.data.requestorEmail, ">", "  |  Via support@mintchip.ca")
          .end()
        .end()
        .start('div')
          .start().show(this.status$.map(function (a) { return a !== 'Solved' }))
            .tag({ class: 'foam.support.view.ReplyView' })
          .end()
          .start().add(this.slot(function (messages) {
            if ( ! messages ) return;

            var self = this;
            return this.E().forEach(messages, function (message) {
              self.tag({ class: 'foam.support.view.MessageCard', message: message });
            });
          }, this.messages$)).end()
          .end()
        .end();
    },

    function formatDate(date) {
      return date.toLocaleString('en-us', { month: 'short' }) + ' ' +
        date.getDate() + ' ' +
        date.getHours() + ':' +
        date.getMinutes();
    }
  ],

  actions: [
    {
      name: 'backAction',
      label: 'Back',
      code: function(X) {
        this.hideSummary = false;
        X.stack.back();
      }
    },
    {
      name: 'submitAs',
      code: function (X) {
        var self = this;
        var receiverId = this.data.receiverId ? this.data.receiverId : null;
        var messageType = this.viewData.variant ? 'Internal' : 'Public';

        var message = this.TicketMessage.create({
          senderId: this.data.userId,
          receiverId: receiverId,
          dateCreated: new Date(),
          message: this.viewData.message,
          type: messageType
        });

        this.user.tickets.put(this.data).then(function(a) {
          if ( ! a ) return;
          if ( self.viewData.message === '' ) {
            self.stack.push({ class: 'foam.support.view.TicketView' });
            return;
          }

          self.data.messages.put(message).then(function(a) {
            if ( ! a ) return;
            if ( ! self.data.emailId ) {
              self.data.emailId = 2;
              self.user.tickets.put(self.data);
            }

            self.stack.push({ class: 'foam.support.view.TicketView' });
          });
        });
      }
    },
    {
      name: 'submitAsDropDown',
      label: '',
      code: function (X) {
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
                  self.data.status = status;
                  self.submitAsPopUp.close();
                })
                .end();
            })
          }, this.data.status$));

        this.submitAsMenuBtn_.add(this.submitAsPopUp);
      }
    },
    {
      name: 'followUp',
      code: function (X) {
        var self = this;
        this.data.status = 'Pending';

        this.user.tickets.put(this.data).then(function(a){
          if ( ! a ){
            throw new Error('No ticket created');
          }
          self.stack.push({ class: 'foam.support.view.TicketView' });
        });
      }
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function () {
        var self = this;
        this.dao.select().then(function (a) {
          self.messages = a.array;
        });
      }
    }
  ]
});
