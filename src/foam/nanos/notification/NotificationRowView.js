  /**
  *@license
  *Copyright 2018 The FOAM Authors. All Rights Reserved.
  *http://www.apache.org/licenses/LICENSE-2.0
  */

  foam.CLASS({
    package: 'foam.nanos.notification',
    name: 'NotificationRowView',
    extends: 'foam.u2.View',

    requires: [
      'foam.nanos.auth.User',
      'foam.nanos.notification.NotificationView',
      'foam.u2.PopupView'
    ],

    imports: [
      'invoiceDAO',
      'notificationDAO',
      'stack',
      'user',
      'userDAO'
    ],

    exports: [
      'as data'
    ],

    css: `
      /*^ {
        padding-right: 8px;
        margin: 8px;
        display: flex;
        //background: gray;
        width: 220px;
        border-radius: 5px;
      }
      *//*^:hover {
        background: #DDD;
      }*//*
      ^ .id {
        padding: 8px;
        border-radius: 4px 0 0 4px;
        //color: white;
        //background: #607D8B;
      }*/
      ^ .body {
        padding-bottom:10px;
        padding-top:20px;
        padding-left:20px;
        width: 414px;
        height: 14px;
        font-family: Roboto;
        font-size: 12px;
        font-weight: normal;
        font-style: normal;
        font-stretch: normal;
        line-height: 1.17;
        letter-spacing: 0.2px;
        text-align: left;
        color: #093649;
      }
      ^ i {
        margin-top: 5px;
      }
      ^ .popUpDropDown {
        padding: 0 !important;
        z-index: 1000;
        width: 165px;
        background: white;
        opacity: 1;
        box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
      }
      ^ .net-nanopay-ui-ActionView-optionsDropDown {
        width: 26px;
        height: 26px;
        background-color: rgba(164, 179, 184, 0.0);
        float: right;
        margin-right:20px;
        margin-top:20px;
      }
      ^ .net-nanopay-ui-ActionView-optionsDropDown > img {
        height:23px;
      }
      ^ .dot{
        height: 500px;
        width: 500px;
        border-radius: 50%;
        color:black;
      }
      ^ .net-nanopay-ui-ActionView-optionsDropDown:hover {
        background-color: rgba(164, 179, 184, 0.3);
      }
      ^ .popUpDropDown > div {
        width: 165px;
        height: 30px;
        font-size: 14px;
        font-weight: 300;
        letter-spacing: 0.2px;
        color: #093649;
        line-height: 30px;
      }
      ^ .divBody {
        background: black !important;
      }
      ^ .popUpDropDown > div:hover {
        background-color: #59a5d5;
        color: white;
        cursor: pointer;
      }
      ^ .net-nanopay-ui-ActionView-link {
        background-color: rgba(201, 76, 76, 0.0);
        width: 135px;
        height: 40px;
        border-radius: 2px;
        border: solid 1px #59a5d5;
        margin-bottom:20px;
        margin-left:20px;
        margin-top:10px;
      }
      ^ .net-nanopay-ui-ActionView-link > span {
        height: 40px;
        font-family: Roboto;
        font-size: 14px;
        font-weight: 300;
        line-height: 2.86;
        letter-spacing: 0.2px;
        text-align: center;
        color: #59a5d5;
      }
      ^ .net-nanopay-ui-ActionView-popup {
        background-color: rgba(201, 76, 76, 0.0);
        width: 135px;
        height: 40px;
        border-radius: 2px;
        border: solid 1px #59a5d5;
        margin-bottom:20px;
        margin-left:20px;
        margin-top:10px;
      }
      ^ .net-nanopay-ui-ActionView-popup > span {
        height: 40px;
        font-family: Roboto;
        font-size: 14px;
        font-weight: 300;
        line-height: 2.86;
        letter-spacing: 0.2px;
        text-align: center;
        color: #59a5d5;
      }
    `,

    properties: [
      'of',
      'optionsBtn_',
      'optionPopup_'
    ],

    methods: [
      function initE() { 
        if ( ! this.data.read ) {
          this.start('div').addClass('divBodyUnread')
        } else {
          this.start('div').addClass('divBody')
        }
        this
          .on('mouseover', this.read)
          .addClass(this.myClass());
          this.start(this.OPTIONS_DROP_DOWN, { icon: 'images/ic-options.png', showLabel:true }, this.optionsBtn_$).end();
          this.add(this.NotificationView.create({of: this.data.cls_, data: this.data}));
      }
    ],

    actions: [
    
      {
        name: 'optionsDropDown',
        label: '',
        code: function (X) {
          var self = this;
          self.optionPopup_ = this.PopupView.create({
            width: 165,
            x: -137,
            y: 40
          });

          self.optionPopup_.addClass('popUpDropDown')
            .start('div').add('Remove')
              .on('click', this.removeNotification)
            .end()
            .callIf(this.data.notificationType != 'General', function(){
              this.start('div')
                .add('Not show like this')
                .on('click', self.notShow)
              .end()
            })
            .start('div')
              .add('Mark as Unread')
              .on('click', this.markUnread)
            .end()
          self.optionsBtn_.add(self.optionPopup_);
        }
      },
    ],

    listeners: [

      function removeNotification() {
        this.notificationDAO.remove(this.data);
      },
      
      function notShow() {
        this.user = this.user.clone();
        this.user.disabledTopics.push(this.data.notificationType);
        this.userDAO.put(this.user);
        this.stack.push({ class: 'foam.nanos.notification.NotificationListView'});
      },

      function read(){
        if ( ! this.data.read ) {
            this.data.read = true;
            this.notificationDAO.put(this.data);
        }
      },

      function markUnread(){
        if ( this.data.read ) {
          this.data.read = false;
          this.notificationDAO.put(this.data); 
        }
        this.stack.push({ class: 'foam.nanos.notification.NotificationListView'});
      }
    ]
  });
