/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'NotificationView',
  extends: 'foam.u2.Controller',
  documentation: 'Notification controller',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'currentMenu',
    'group',
    'notificationDAO',
    'stack',
    'user'
  ],

  requires: [
    'foam.nanos.notification.Notification',
    'foam.nanos.notification.NotificationRowView',
    'foam.u2.stack.Stack'
  ],

  exports: [
    'notificationDAO'
  ],

  css: `
     ^ .foam-u2-DAOList > div {
      background: white;
      margin-top:1px;
      min-height: 66px;
    }
     ^ .foam-u2-DAOList > div:nth-child(odd) {
      background: #f6f9f9;
    }
     ^ .notifs {
      width:500px;
      margin:0 auto;
    }
     ^ h3 {
      margin-bottom:20px;
      width: 105px;
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
     ^ .unread .foam-u2-DAOList > div {
      background-color: rgba(89, 165, 213, 0.3)
    }
  `,

  properties: [
    {
      name: 'notifications',
      expression: function(notificationDAO) {
        return this.notificationDAO.where(
          this.AND(
            this.EQ(this.Notification.READ, true),
             this.OR(
              this.EQ(this.Notification.USER_ID, this.user.id),
              this.EQ(this.Notification.GROUP_ID, this.group.id),
              this.EQ(this.Notification.BROADCASTED, true)
            ),
            this.NOT(this.IN(
                this.Notification.NOTIFICATION_TYPE,
                this.user.disabledTopics))
          )
        ).orderBy(this.DESC(this.Notification.ISSUED_DATE));
      },
      view: {
        class: 'foam.u2.DAOList',
        rowView: { class: 'foam.nanos.notification.NotificationRowView' }
      }
    },
    {
      name: 'unread',
      expression: function(notificationDAO) {
        return this.notificationDAO.where(
          this.AND(
            this.EQ(this.Notification.READ, false),
             this.OR(
              this.EQ(this.Notification.USER_ID, this.user.id),
              this.EQ(this.Notification.GROUP_ID, this.group.id),
              this.EQ(this.Notification.BROADCASTED, true)
            ),
            this.NOT(this.IN(
                this.Notification.NOTIFICATION_TYPE,
                this.user.disabledTopics))
          )
        ).orderBy(this.DESC(this.Notification.ISSUED_DATE));
      },
      view: {
        class: 'foam.u2.DAOList',
        rowView: { class: 'foam.nanos.notification.NotificationRowView' }
      }
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass()).add(this.notificationsE());
    },

    function notificationsE() {
      return this.E()
        .addClass('notifs')
        .start('h3')
          .add('Notifications')
        .end()
        .start('div').addClass('unread').add(this.UNREAD).end()
        .add(this.NOTIFICATIONS);
    }
  ]
});
