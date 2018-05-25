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

  requires: [ 'foam.nanos.auth.Group', 'foam.nanos.menu.SubMenuView', 'foam.nanos.menu.Menu', 'foam.nanos.notification.Notification' ],

  css: `
    ^ {
      display: inline-block;
      float: right;
      margin-right: 40px;
    }
    ^ h1 {
      margin: 0;
      padding: 15px;
      font-size: 16px;
      display: inline-block;
      font-weight: 100;
      color: white;
      position: relative;
      bottom: 5;
    }
    ^ h1:hover {
      cursor: pointer;
      text-shadow: 0 0 5px white, 0 0 10px white;
    }
    ^carrot {
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 5px solid white;
      display: inline-block;
      position: relative;
      right: 10;
      bottom: 7;
      cursor: pointer;
    }
    ^ img{
      width: 25px;
      display: inline-block;
      position: relative;
      top: 2px;
      right: 10px;
      cursor: pointer;
    }
    ^user-name:hover {
      cursor: pointer;
    }
    ^ .foam-nanos-menu-SubMenuView-inner {
      position: absolute;
      float: right;
      z-index: 10001;
      width: 215px;
      background: white;
      box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
      top: 65px;
      right: 15px;
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
      -ms-transform: translate(130px, -16px);
      transform: translate(130px, -16px);
    }
    ^ .profile-container{
      display: inline-block;
      cursor: pointer;
      padding-top: 10px;
      height: 40px;
    }
    ^ img:hover {
      cursor: pointer;
      padding-bottom: 0px;
      border-bottom: 1px solid white;
    }
    ^ img: {
      height:30px;
    }
    ^ div .img {
      width:30px;
      display: inline-block;
      //padding-bottom:0px;
      cursor: pointer;
      //border-bottom: 1px solid transparent;
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
      width:15px;
      height:15px;
      position: relative;
      top: -30px;
      left:5px;
      text-align: center;
      font-size: 8px;
    }
    .net-nanopay-ui-topNavigation-UserTopNavView .dot > span {
        padding-top: 3px;
        display: inline-block;
    }
    /* ^ span {
      top: -15px;
    } */
      .img{
      display: inline-block;
    }
  `,

  properties: [
    {
      class: "Int",
      name: 'countUnread'
    },
    {
      name: 'userCur',
      factory: function(user){
        return this.user;
      }
    }
  ],
  

  methods: [
    function initE() {
      this.notificationDAO.on.sub(this.onDAOUpdate);
      this.user.id$.sub(this.onDAOUpdate);
      this.onDAOUpdate();
      var self = this;
      this
        .addClass(this.myClass())

        .start('div').addClass('img').on('click', function() {
          this.stack.push({ class: "foam.nanos.notification.NotificationListView" });
        }.bind(this))
          .start('img').attrs({src: "images/bell.png"}).end()
          .add(this.slot(function(countUnread){
            if ( countUnread > 0 )
              return this.E().start('div').addClass('dot')
                .add(this.countUnread$)
              .end()
          })).end()

        .start().addClass('profile-container')
          .on('click', function() {
            this.tag(this.SubMenuView.create({menu: this.Menu.create({id: 'settings'})}))
          }.bind(this))
          .start('h1')
            .add( this.user.firstName$ ).addClass(this.myClass('user-name'))
          .end()
        .end()
        .start('div')
          .addClass(this.myClass('carrot'))
            .on('click', function() {
              this.tag(this.SubMenuView.create({menu: this.Menu.create({id: 'settings'})}))
            }.bind(this))
        .end();
    }
  ],

  listeners:[
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function () {
          var self = this;
          var group = self.user.group;
          var id = self.user.id;
          if ( id != 0 ) {
            this.notificationDAO.where(
              this.AND(
                this.EQ(this.Notification.READ, false),
                this.OR(
                  this.EQ(this.Notification.USER_ID, id),
                  this.EQ(this.Notification.GROUP_ID, group),
                  this.EQ(this.Notification.BROADCASTED, true)
                ),
                this.NOT(this.IN(this.Notification.NOTIFICATION_TYPE, this.user.disabledTopics))
              )
            ).select(this.COUNT()).then(function(count) {
                self.countUnread = count.value;
            })
          }
      }
    }
  ]
});
