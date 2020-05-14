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
      'foam.nanos.notification.NotificationCitationView',
      'foam.u2.view.OverlayActionListView'
    ],

    imports: [
      'invoiceDAO',
      'notificationDAO',
      'stack',
      'user',
      'userDAO'
    ],

    exports: [
      'as rowView'
    ],

    css: `
      ^ {
        position: relative;
        padding: 8px;
      }
      ^ .foam-u2-view-OverlayActionListView {
        position: absolute;
        top: 8px;
        right: 8px;
      }
      ^ i {
        margin-top: 5px;
      }
      ^ .msg {
        font-size: 12px;
        word-wrap: break-word;
        line-height: 1.4;
        width: 414px;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        display: -webkit-box;
        text-overflow: ellipsis;
        margin-right: 16px;
        overflow: hidden;
        color: /*%BLACK%*/ #1e1f21;
      }
      ^ .msg.fully-visible {
        display: block;
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
          .addClass(this.myClass())
          .tag(this.OverlayActionListView, {
            data: [
              this.READ,
              this.MARK_UNREAD,
              this.HIDE_NOTIFICATION_TYPE,
              this.REMOVE_NOTIFICATION
            ],
            obj: this.data
          })
          .tag(this.NotificationCitationView, {
            of: this.data.cls_,
            data: this.data
          });
      }
    ],

    actions: [
      {
        name: 'removeNotification',
        code: function(X) {
          var self = X.rowView;
          self.notificationDAO.remove(self.data);
        },
        confirmationRequired: true
      },

      function hideNotificationType(X) {
        var self = X.rowView;
        self.user = self.user.clone();
        self.user.disabledTopics.push(self.data.notificationType);
        self.userDAO.put(self.user);
        self.stack.push({
          class: 'foam.nanos.notification.NotificationView'
        });
      },

      function read(X) {
        var self = X.rowView;
        if ( ! self.data.read ) {
          self.data.read = true;
          self.notificationDAO.put(this.data);
        }
      },

      function markUnread(X) {
        var self = X.rowView;
        if ( self.data.read ) {
          self.data.read = false;
          self.notificationDAO.put(self.data);
        }
        self.stack.push({
          class: 'foam.nanos.notification.NotificationView'
        });
      }
    ]
  });
