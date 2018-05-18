foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'NotificationSettingsView',
  extends: 'foam.u2.View',
documentation: 'Settings / Personal View',

implements: [
  'foam.mlang.Expressions',
],
imports: [
  'auth',
  'notificationDAO',
  'stack',
  'user',
  'userDAO'
],
requires: [
  'foam.nanos.notification.Notification',
  'foam.u2.dialog.NotificationMessage'
],
css:`
      ^{
        width: 1280px;
        margin: auto;
      }
      ^ .Container{
        width: 960px;
        padding-bottom: 13px;
        border-radius: 2px;
        background-color: #ffffff;
        margin-top: 50px;
        margin-left: 160px;
      }
      ^ .firstName-Text{
        margin-left: 20px;
        margin-right: 88px;
        margin-bottom: 8px;
      }
      ^ .lastName-Text{
        margin-right: 82px;
        margin-bottom: 8px;
      }
      ^ .jobTitle-Text{
        margin-bottom: 8px;
      }
      ^ h1{
        opacity: 0.6;
        font-family: Roboto;
        font-size: 20px;
        font-weight: 300;
        line-height: 1;
        letter-spacing: 0.3px;
        text-align: left;
        color: #093649;
        display: inline-block;
      }
      ^ h2{
        width: 150px;
        font-family: Roboto;
        font-size: 14px;
        font-weight: 300;
        letter-spacing: 0.2px;
        text-align: left;
        color: #093649;
        display: inline-block;
      }
      ^ input{
        background-color: #ffffff;
        border: solid 1px rgba(164, 179, 184, 0.5);
        padding: 10px;
        font-family: Roboto;
        font-size: 12px;
        line-height: 1.33;
        letter-spacing: 0.2;
        text-align: left;
        color: #093649;
      }
      ^ .firstName-Input{
        width: 215px;
        height: 40px;
        margin-left: 20px;
        margin-right: 20px;
        margin-bottom: 20px;
      }
      ^ .lastName-Input{
        width: 215px;
        height: 40px;
        margin-right: 20px;
      }
      ^ .jobTitle-Input{
        width: 450px;
        height: 40px;
      }
      ^ .emailAddress-Text{
        margin-left: 20px;
        margin-bottom: 8px;
        margin-right: 322px;
      }
      ^ .phoneNumber-Dropdown{
        width: 80px;
        height: 40px;
        background-color: #ffffff;
        border: solid 1px rgba(164, 179, 184, 0.5);
        font-family: Roboto;
        font-size: 12px;
        line-height: 1.33;
        letter-spacing: 0.2px;
        text-align: left;
        color: #093649;
        margin-right: 10px;
      }
      ^ .emailAddress-Input{
        width: 450px;
        height: 40px;
        margin-left: 20px;
        margin-right: 20px;
        margin-bottom: 19px;
        padding: 0;
      }
      ^ .phoneNumber-Input{
        width: 360px;
        height: 40px;
      }
      ^ .update-BTN{
        width: 135px;
        height: 40px;
        border-radius: 2px;
        font-family: Roboto;
        font-size: 14px;
        line-height: 2.86;
        letter-spacing: 0.2px;
        text-align: center;
        color: #ffffff;
        cursor: pointer;
        border: 1px solid %SECONDARYCOLOR%;
        background-color: %SECONDARYCOLOR%;
        margin-left: 20px;
        margin-top: 19px;
      }
      ^ .update-BTN:hover {
        opacity: 0.9;
        border: 1px solid %SECONDARYCOLOR%;
      }
      ^ .check-Box{
        border: solid 1px rgba(164, 179, 184, 0.5);
        width: 14px;
        height: 14px;
        border-radius: 2px;
        margin-right: 20px;
        position: relative;
      }
      ^ .foam-u2-CheckBox{
        margin-left: 20px;
        padding-bottom: 11px;
        display: inline-block;
      }
      ^ .checkBox-Text{
        height: 16px;
        font-family: Roboto;
        font-size: 12px;
        line-height: 1.33;
        letter-spacing: 0.2px;
        text-align: left;
        color: #093649;
        display: block;
        margin-bottom: 11px;
      }
      ^ .status-Text{
        width: 90px;
        height: 14px;
        font-family: Roboto;
        font-size: 12px;
        letter-spacing: 0.2px;
        text-align: left;
        color: #a4b3b8;
        margin-left: 20px;
        margin-right: 770px;
        display: inline-block;
      }
      ^ .personalProfile-Text{
        width: 141px;
        height: 20px;
        margin-left: 20px;
        margin-right: 644px;
      }
      ^ .toggleDiv {
        position: relative;
        display: inline-block;
        top: -5;
      }

      ^ .disabled {
        color: lightgray;
      }
      /* ^ .input {
        display: block;
      } */
      /* .checkbox {
      margin:0 auto;
      padding-top: 20px;
      padding-left: 20px;
      } */
      }
    `,

    properties: [
      {
        name: 'notifs',
        factory: function(notificationDAO) {
          return this.notificationDAO;
        }
      }
    ],

    methods: [
      function initE(){
        this.SUPER();
        var self = this;
        this
          .addClass(this.myClass())
          .start()
          //######### Notifications settings for tab display
          this.start().addClass('Container')
            .start('h1').add("Notification Tab Settings").addClass('personalProfile-Text').end()
            .call(this.addNotifCheckBoxes, [self])
            .start(this.UPDATE_NOTIFS_TAB).addClass('update-BTN').end()
          .end()

          //######### Notifications settings for email

          this.start().addClass('Container')
              .start('h1').add("Notification Email Settings").addClass('personalProfile-Text').end()
              .call(this.addEmailCheckBoxes, [self])
              .start(this.UPDATE_NOTIFS_EMAIL).addClass('update-BTN').end()
          .end()
        .end();
      },
      function addNotifCheckBoxes(self) {
        var self2 = this;
        return this.start('div').addClass('checkbox').call(function() {
          self.notifs.where(self.OR(
            self.EQ(self.Notification.USER_ID, self.user.id),
            self.EQ(self.Notification.GROUP_ID, self.user.group),
            self.EQ(self.Notification.BROADCASTED, true)
          )).select(self.GROUP_BY(foam.nanos.notification.menu.Notification.NOTIFICATION_TYPE, self.COUNT())).then(function(g) {
              for ( var key in g.groups ) {
                if ( key != "General" ) {
                  if ( key != '' ) {
                    if ( self.user.disabledNotifs.includes(key) ) {
                      self2.br().start('input')
                        .attrs({
                          type: 'checkbox',
                          name: 'notifsTab',
                          value: key,
                          checked: false
                        }).end().add(key)
                    } else {
                      self2.br().start('input')
                        .attrs({
                          type: 'checkbox',
                          name: 'notifsTab',
                          value: key,
                          checked: true
                        }).end().add(key)
                    }
                  }
                }
              }
          });
          })
        .end();
      },

      function addEmailCheckBoxes(self) {
        var self2 = this;
        return this.start('div').addClass('checkbox').br().call(function() {
          self.notifs.where(self.OR(
            self.EQ(self.Notification.USER_ID, self.user.id),
            self.EQ(self.Notification.GROUP_ID, self.user.group),
            self.EQ(self.Notification.BROADCASTED, true)
          )).select(self.GROUP_BY(foam.nanos.notification.menu.Notification.NOTIFICATION_TYPE, self.COUNT())).then(function(g) {
              for ( var key in g.groups ) {
                if ( key != "General" ) {
                  if ( key != '' ) {
                    if ( self.user.disabledNotifsEmail.includes(key) ) {
                      self2.br().start('input')
                        .attrs({
                          type: 'checkbox',
                          name: 'notifsEmail',
                          value: key,
                          checked: false
                        }).end().add(key)
                    } else {
                      self2.br().start('input')
                        .attrs({
                          type: 'checkbox',
                          name: 'notifsEmail',
                          value: key,
                          checked: true
                        }).end().add(key)
                    }
                  }
                }
              }
          });
          })
        .end();
      }
    ],

    actions: [
      {
        name: 'updateNotifsTab',
        label: 'Update',
        code: function() {
          var notifs = document.getElementsByName("notifsTab");
          this.user = this.user.clone();
          for (i = 0; i < notifs.length; i++) {
            var type = notifs[i].value;
              if (notifs[i].checked) {
                while ( this.user.disabledNotifs.includes(type) ) {
                    var index = this.user.disabledNotifs.indexOf(type);
                    this.user.disabledNotifs.splice(index, 1);
                }
              } else {
                if ( ! this.user.disabledNotifs.includes(type) ) {
                  this.user.disabledNotifs.push(type);
                }
              }
            }
            this.userDAO.put(this.user);
            this.stack.push({ class: 'foam.nanos.notification.NotificationListView'});
          }

      },
      {
        name: 'updateNotifsEmail',
        label: 'Update',
        code: function() {
          var notifs = document.getElementsByName("notifsEmail");
          this.user = this.user.clone();
          for (i = 0; i < notifs.length; i++) {
            var type = notifs[i].value;
              if (notifs[i].checked) {
                while ( this.user.disabledNotifsEmail.includes(type) ) {
                    var index = this.user.disabledNotifsEmail.indexOf(type);
                    this.user.disabledNotifsEmail.splice(index, 1);
                }
              } else {
                if ( ! this.user.disabledNotifsEmail.includes(type) ) {
                  this.user.disabledNotifsEmail.push(type);
                }
              }
            }
            this.userDAO.put(this.user);
            this.stack.push({ class: 'foam.nanos.notification.NotificationListView'});
          }

      }
    ]
})