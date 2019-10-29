foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'NotificationMenuItem',
  extends: 'foam.u2.View',

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
    'user'
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
    }
    ^ .icon-container:hover {
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

  methods: [
    function initE() {
      this.notificationDAO.on.sub(this.onDAOUpdate);
      this.user$.dot('id').sub(this.onDAOUpdate);
      this.group$.dot('id').sub(this.onDAOUpdate);
      this.onDAOUpdate();

      this.addClass(this.myClass())
        .addClass('icon-container')
        .enableClass('selected', this.currentMenu$.map((menu) => {
          return this.Menu.isInstance(menu) && menu.id === 'notifications';
        }))
        .on('click', this.changeToNotificationsPage.bind(this))

        .start('img')
          .attrs({ src: 'images/bell.png' })
        .end()
        .start('span')
          .addClass('dot')
          .add(this.countUnread$)
          .show(this.showCountUnread$)
        .end()
      .end();
    },

    function changeToNotificationsPage() {
      this.menuDAO.find('notifications').then((queryResult) => {
        if ( queryResult == null ) {
          throw new Error('No menu in menuDAO with id "notifications".');
        }
        queryResult.launch();
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
