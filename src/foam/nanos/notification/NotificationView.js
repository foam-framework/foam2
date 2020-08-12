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
      margin-top:16px;
      min-height: 50px;
      border-radius: 3px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
      border: solid 1px #e7eaec;
      background-color: #ffffff;
    }
     ^ .notifs {
      margin-left: 32px;
    }
    ^ .title {
      width: 208px;
      height: 40px;
      font-family: /*%FONT1%*/;
      font-size: 35px;
      font-weight: 600;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.14;
      letter-spacing: normal;
      color: #1e1f21;
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
        ).orderBy(this.DESC(this.Notification.CREATED));
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
        ).orderBy(this.DESC(this.Notification.CREATED));
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
        .start()
          .add('Notifications').addClass('title')
        .end()
        .start('div').add(this.UNREAD).end()
        .add(this.NOTIFICATIONS);
    }
  ]
});
