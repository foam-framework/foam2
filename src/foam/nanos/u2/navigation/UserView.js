/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'UserView',
  extends: 'foam.u2.Element',

  documentation: 'View user name and user nav settings',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'currentMenu',
    'group',
    'lastMenuLaunched',
    'menuDAO',
    'notificationDAO',
    'stack',
    'user',
    'window'
  ],

  requires: [
    'foam.nanos.auth.Group',
    'foam.nanos.menu.Menu',
    'foam.nanos.menu.SubMenuView',
    'foam.nanos.notification.Notification'
  ],

  css: `
    ^ {
      display: flex;
      margin: 10 40px;
    }
    ^ .icon-container {
      margin-top: 4;
      position: relative;
    }
    ^ .icon-container.selected {
      padding-bottom: 0; /* Override */
    }
    ^ .icon-container:hover {
      border-bottom: 1px solid white;
    }
    ^ h1 {
      font-size: 16px;
      font-weight: 100;
      color: white;
    }
    ^carrot {
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 5px solid white;
    }
    ^ > .profile-container {
      cursor: pointer;
      display: flex;
      align-items: center;
      height: 40px;
      margin-left: 10px;
    }
    ^ > .profile-container:hover {
      cursor: pointer;
    }
    ^ > .profile-container > * {
      margin: 0 5px 5px;
    }
    ^ img {
      height: 25px;
      width: 25px;
      padding-bottom: 5px;
      cursor: pointer;
      border-bottom: 1px solid transparent;
      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }
    ^ .dot {
      border-radius: 50%;
      display: table-caption;
      background: red;
      width: 15px;
      height: 15px;
      position: absolute;
      top: -2px;
      left: 13px;
      text-align: center;
      font-size: 8px;
    }
    ^ .dot > span {
        padding-top: 3px;
        display: inline-block;
    }
    ^ .foam-nanos-menu-SubMenuView-inner {
      position: absolute;
      float: right;
      z-index: 10001;
      width: 215px;
      background: white;
      box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
      top: 65px;
      right: 0px;
    }
    ^ .foam-nanos-menu-SubMenuView-inner > div {
      height: 40px;
      padding-left: 50px;
      font-size: 14px;
      font-weight: 300;
      color: #093649;
      line-height: 25px;
    }
    ^ .foam-nanos-menu-SubMenuView-inner > div:last-child {
      background-color: #f6f9f9;
      box-shadow: 0 -1px 0 0 #e9e9e9;
      font-size: 14px;
      color: #c82e2e;
    }
    ^ .foam-nanos-menu-SubMenuView-inner > div:hover {
      background-color: %SECONDARYCOLOR%;
      color: white;
      cursor: pointer;
    }
    ^ .foam-nanos-menu-SubMenuView-inner::before {
      content: ' ';
      position: absolute;
      height: 0;
      width: 0;
      border: 8px solid transparent;
      border-bottom-color: white;
      -ms-transform: translate(110px, -16px);
      transform: translate(110px, -16px);
    }
    ^ .currency-container {
      all:none !important;
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
      expression: (countUnread) => countUnread > 0,
    },
    {
      name: 'userCur',
      factory: (user) => this.user
    }
  ],

  methods: [
    function initE() {
      this.notificationDAO.on.sub(this.onDAOUpdate);
      this.user.id$.sub(this.onDAOUpdate);
      this.onDAOUpdate();
      this
        .addClass(this.myClass())

         //currency menu
        .start().addClass('currency-container')
          .tag({ class: 'net.nanopay.ui.topNavigation.CurrencyChoiceView' })
        .end()

        // The notifications container
        this.start('div')
          .addClass('icon-container')

          // Show blue underline if user is on notifications page.
          .enableClass('selected', this.currentMenu$.map((menu) => {
            return this.Menu.isInstance(menu) && menu.id === 'notifications';
          }))

          // Clicking on the bell icon will change to the notifications page.
          .on('click', this.changeToNotificationsPage.bind(this))

          .start('img')
            .attrs({ src: 'images/bell.png' })
          .end()

          // The unread notification count bubble. Only shown if there is at
          // least one unread notification.
          .start('span')
            .addClass('dot')
            .add( this.countUnread$ )
            .show( this.showCountUnread$ )
          .end()
        .end()

        // The username and settings dropdown
        .start().addClass('profile-container')
          .on('click', () => {
            this.tag(this.SubMenuView.create({
              menu: this.Menu.create({ id: 'settings' })
            }));
          })
          .start('h1')
            .add( this.user.firstName$ ).addClass(this.myClass('user-name'))
          .end()
          .start('div')
            .addClass(this.myClass('carrot'))
          .end()
        .end();
    },

    /** Change the application page to #notifications */
    function changeToNotificationsPage() {
      this.menuDAO
          .where(this.EQ(this.Menu.ID, 'notifications'))
          .select()
          .then((queryResult) => {
            if ( queryResult.length === 0 ) {
              throw Error('No menu item in menuDAO with id "notifications"');
            }
            var notificationMenu = queryResult.array[0];
            notificationMenu.launch();
          })
          .catch((err) => console.error(err));
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        var group = this.user.group;
        var id    = this.user.id;
        if ( id != 0 ) {
          this.notificationDAO.where(
            this.AND(
              this.EQ(this.Notification.READ, false),
              this.OR(
                this.EQ(this.Notification.USER_ID, id),
                this.EQ(this.Notification.GROUP_ID, group),
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
