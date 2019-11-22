/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
*/
foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'NotificationMenuItem',
  extends: 'foam.u2.View',

  documentation: `Notification bell icon displaying number of unread notifications
      along with redirect to notification view when clicked.`,

  requires: [
    'foam.nanos.auth.Group',
    'foam.nanos.menu.Menu',
    'foam.nanos.notification.Notification'
  ],

  imports: [
    'currentMenu',
    'group',
    'menuDAO',
    'notificationDAO',
    'pushMenu',
    'user'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  css: `
    ^ {
      display: flex;
      align-items: normal;
      width: 40px;
    }
    ^ img {
      height: 25px;
      width: 25px;
      cursor: pointer;
      border-bottom: 1px solid transparent;
      padding-bottom: 10px;
      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }
    ^ img:hover {
      border-bottom: 1px solid white;
    }
    ^ .selected-icon {
      border-bottom: 1px solid white;
    }
    ^ .dot {
      border-radius: 50%;
      display: inline-block;
      background: red;
      width: 15px;
      height: 15px;
      position: relative;
      right: 10px;
      text-align: center;
      font-size: 8px;
    }
    ^ .dot > span {
      padding-top: 3px;
      display: inline-block;
    }
  `,

  properties: [
    {
      class: 'Int',
      name: 'countUnread'
    },
    {
      class: 'Boolean',
      name: 'showCountUnread',
      expression: (countUnread) => countUnread > 0
    }
  ],

  constants: [
    { name: 'BELL_IMAGE', value: 'images/bell.png' }
  ],

  messages: [
    { name: 'INVALID_MENU', message: `No menu in menuDAO with id: "notifications".` }
  ],

  methods: [
    function initE() {
      this.notificationDAO.on.sub(this.onDAOUpdate);
      this.user$.dot('id').sub(this.onDAOUpdate);
      this.group$.dot('id').sub(this.onDAOUpdate);
      this.onDAOUpdate();

      this.addClass(this.myClass())
        .addClass('icon-container')
        .on('click', this.changeToNotificationsPage.bind(this))

        .start('img')
          .enableClass('selected-icon', this.currentMenu$.map((menu) => {
            return this.Menu.isInstance(menu) && menu.id === 'notifications';
          }))
          .attrs({ src: this.BELL_IMAGE })
        .end()
        .start('span')
          .addClass('dot')
          .add(this.countUnread$)
          .show(this.showCountUnread$)
        .end()
      .end();
    },

    function changeToNotificationsPage() {
      this.menuDAO.find('notifications').then((menu) => {
        if ( menu == null ) {
          throw new Error(this.INVALID_MENU);
        }
        this.pushMenu(menu.id);
      });
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        if ( ! this.group || ! this.user ) return;
        if ( this.user.id ) {
          this.notificationDAO.where(
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
          ).select(this.COUNT()).then((count) => {
            this.countUnread = count.value;
          });
        }
      }
    }
  ]
});
