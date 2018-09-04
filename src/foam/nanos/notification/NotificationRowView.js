  /**
   * @license
   * Copyright 2018 The FOAM Authors. All Rights Reserved.
   * http://www.apache.org/licenses/LICENSE-2.0
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
      ^ i {
        margin-top: 5px;
      }
      ^ .popUpDropDown {
        padding: 0 !important;
        z-index: 1000;
        background: white;
        opacity: 1;
        box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
      }
      ^ .net-nanopay-ui-ActionView-optionsDropDown {
        width: 26px !important;
        height: 26px !important;
        border: none !important;
        background-color: rgba(164, 179, 184, 0.0);
        float: right;
        margin-right:20px !important;
        margin-top:20px !important;
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
        font-size: 14px;
        font-weight: 300;
        letter-spacing: 0.2px;
        color: #093649;
        padding: 10px 16px;
        text-align: left;
      }
      ^ .popUpDropDown > div:hover {
        background-color: #59a5d5;
        color: white;
        cursor: pointer;
      }
      ^ .net-nanopay-ui-ActionView {
        background-color: rgba(201, 76, 76, 0.0);
        width: 135px;
        height: 40px;
        border-radius: 2px;
        border: solid 1px #59a5d5;
        margin-left:20px;
        margin-top:10px;
      }
      ^ .net-nanopay-ui-ActionView:hover {
        background-color: #d2e2ef;
      }
      ^ .net-nanopay-ui-ActionView > span {
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
      ^ div {
        padding-bottom:20px;
      }
      ^ .msg {
        font-size: 12px;
        word-wrap: break-word;
        padding-bottom: 0;
        padding-top: 20;
        line-height: 1.4;
        padding-left: 20px;
        width: 414px;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        display: -webkit-box;
        text-overflow: ellipsis;
        margin-right: 10;
        overflow: hidden;
        color: #093649;
      }
      ^ .msg.fully-visible {
        display: block;
      }
      ^ .popUpDropdown > .destructive-action {
        color: #D81E05;
      }
    `,

    properties: [
      'of',
      'optionsBtn_',
      'optionPopup_'
    ],

    methods: [
      function initE() {
        this
          .on('mouseover', this.read)
          .addClass(this.myClass());

        this.tag(this.OPTIONS_DROP_DOWN, {
          icon: 'images/ic-options.png',
          showLabel: true
        }, this.optionsBtn_$);
        this.add(this.NotificationView.create({
          of: this.data.cls_,
          data: this.data
        }));
      }
    ],

    actions: [
      {
        name: 'optionsDropDown',
        label: '',
        code: function(X) {
          var self = this;
          self.optionPopup_ = this.PopupView.create({
            width: 205,
            x: -160,
            y: 40
          });

          self.optionPopup_.addClass('popUpDropDown')
            .start('div')
              .addClass('destructive-action')
              .add('Remove')
              .on('click', this.removeNotification)
            .end()
            .callIf(this.data.notificationType !== 'General', function() {
              this.start('div')
                .add('Hide notifications like this')
                .on('click', self.hideNotificationType)
              .end();
            })
            .start('div')
              .add('Mark as Unread')
              .on('click', this.markUnread)
            .end();
          self.optionsBtn_.add(self.optionPopup_);
        }
      },
    ],

    listeners: [
      function removeNotification() {
        this.notificationDAO.remove(this.data);
      },

      function hideNotificationType() {
        this.user = this.user.clone();
        this.user.disabledTopics.push(this.data.notificationType);
        this.userDAO.put(this.user);
        this.stack.push({
          class: 'foam.nanos.notification.NotificationListView'
        });
      },

      function read() {
        if ( ! this.data.read ) {
            this.data.read = true;
            this.notificationDAO.put(this.data);
        }
      },

      function markUnread() {
        if ( this.data.read ) {
          this.data.read = false;
          this.notificationDAO.put(this.data);
        }
        this.stack.push({
          class: 'foam.nanos.notification.NotificationListView'
        });
      }
    ]
  });
