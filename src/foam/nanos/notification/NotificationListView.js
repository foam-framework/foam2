foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'NotificationListView',
  extends: 'foam.u2.View',
  documentation: 'Notification controller',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
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
    'as data',
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
     ^ .setting {
      padding-right:0px;
      background: none;
      float: right;
      margin-bottom:20px;
      padding-bottom:0px;
      width: 39px;
      height: 18px;
      font-family: Roboto;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.5;
      letter-spacing: 0.2px;
      text-align: left;
      color: #59a5d5;
    }
     ^ .setting:hover {
      text-decoration: underline;
      cursor: pointer;
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
      color: #093649;
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
              this.EQ(this.Notification.GROUP_ID, this.user.group),
              this.EQ(this.Notification.BROADCASTED, true)
            ), 
            this.NOT(this.IN(this.Notification.NOTIFICATION_TYPE, this.user.disabledTopics))
          )
        ).orderBy(this.DESC(this.Notification.ISSUED_DATE))
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
              this.EQ(this.Notification.GROUP_ID, this.user.group),
              this.EQ(this.Notification.BROADCASTED, true)
            ), 
            this.NOT(this.IN(this.Notification.NOTIFICATION_TYPE, this.user.disabledTopics))
          )
        ).orderBy(this.DESC(this.Notification.ISSUED_DATE))
      },
      view: {
        class: 'foam.u2.DAOList',
        rowView: { class: 'foam.nanos.notification.NotificationRowView' }
      }
    }
  ],
  
  methods: [
    function initE() {
      var self = this;
      this
        .addClass(this.myClass())
        .add(this.notificationsE())
    },

    function notificationsE() {
      return this.E()
        .addClass('notifs')
        .start(this.SETTINGS)
          .addClass('setting')
        .end()
        .start('h3')
          .add('Notifications')
        .end()
        .start('div').addClass('unread').add(this.UNREAD).end()
        .add(this.NOTIFICATIONS)
    }
  ],

  actions: [
    {
      name: 'settings',
      code: function() {
        this.stack.push({ class: 'foam.nanos.notification.NotificationSettingsView' });
      }
    }
  ]
});
