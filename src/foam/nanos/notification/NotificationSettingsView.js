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
  exports: [ 'as data' ],

  requires: [
    'foam.nanos.notification.Notification',
    'foam.u2.dialog.NotificationMessage'
  ],
  css:`
        ^ {
          width: 1280px;
          margin: auto;
        }
        ^ .Container{
          width: 700px;
          padding-bottom: 13px;
          border-radius: 2px;
          background-color: #ffffff;
          margin-top: 50px;
          margin-left: 160px;
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
          margin-top:20px;
          height: 20px;
          margin-left: 20px;
        }
        ^ .disabled {
          color: lightgray;
        }
        ^ .checkbox {
          margin-left: 20px;
        }
        ^ .checkbox > input {
          width: 14px;
          height: 14px;
          border-radius: 2px;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
        }
        ^ .checkBox-Text{
          font-family: Roboto;
          font-size: 12px;
          font-weight: normal;
          display: inline-block;
          letter-spacing: 0.2px;
          margin-left: 20px;
          color: #093649;
          padding-bottom: 10px;
        }
    `,

  properties: [
    {
      name: 'notifications',
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

        //######### Notifications settings for navigation bar display
          this.start().addClass('Container')
            .start('h1').add("Notification Preference").addClass('personalProfile-Text').end()
            .start('div').addClass('checkbox').call(this.addNotifCheckBoxes, [self]).end()
            .start(this.UPDATE_NOTIFS_TAB).addClass('update-BTN').end()
          .end()

          //######### Notifications settings for email
          this.start().addClass('Container')
              .start('h1').add("Email Preference").addClass('personalProfile-Text').end()
              .start('div').addClass('checkbox').call(this.addEmailCheckBoxes, [self]).end()
              .start(this.UPDATE_NOTIFS_EMAIL).addClass('update-BTN').end()
          .end()
        .end();
    },

    function addNotifCheckBoxes(self) {
      var self2 = this;
      return this.call(function() {
        self.notifications.where(self.OR(
          self.EQ(self.Notification.USER_ID, self.user.id),
          self.EQ(self.Notification.GROUP_ID, self.user.group),
          self.EQ(self.Notification.BROADCASTED, true)
        )).select(self.GROUP_BY(foam.nanos.notification.Notification.NOTIFICATION_TYPE, self.COUNT())).then(function(g) {
            for ( var key in g.groups ) {
              if ( key != "General" ) {
                if ( key != '' ) {
                  if ( self.user.disabledTopics.includes(key) ) {
                    self2.br().start('input')
                      .attrs({
                        type: 'checkbox',
                        name: 'notifsTab',
                        value: key,
                        checked: false
                      }).end().start().addClass('checkBox-Text').add(key).end();
                  } else {
                    self2.br().start('input')
                      .attrs({
                        type: 'checkbox',
                        name: 'notifsTab',
                        value: key,
                        checked: true
                      }).end().start().addClass('checkBox-Text').add(key).end();
                  }
                }
              }
            }
        });
      });
    },

    function addEmailCheckBoxes(self) {
      var self2 = this;
      return this.call(function() {
        self.notifications.where(self.OR(
          self.EQ(self.Notification.USER_ID, self.user.id),
          self.EQ(self.Notification.GROUP_ID, self.user.group),
          self.EQ(self.Notification.BROADCASTED, true)
        )).select(self.GROUP_BY(foam.nanos.notification.Notification.NOTIFICATION_TYPE, self.COUNT())).then(function(g) {
            for ( var key in g.groups ) {
              if ( key != "General" ) {
                if ( key != '' ) {
                  if ( self.user.disabledTopicsEmail.includes(key) ) {
                    self2.br().start('input')
                      .attrs({
                        type: 'checkbox',
                        name: 'notifsEmail',
                        value: key,
                        checked: false
                      }).end().start().addClass('checkBox-Text').add(key).end()
                  } else {
                    self2.br().start('input')
                      .attrs({
                        type: 'checkbox',
                        name: 'notifsEmail',
                        value: key,
                        checked: true
                      }).end().start().addClass('checkBox-Text').add(key).end()
                  }
                }
              }
            }
        });
      });
    }
  ],

  actions: [
    {
      name: 'updateNotifsTab',
      label: 'Update',
      code: function() {
        var notifs = document.getElementsByName("notifsTab");
        this.user = this.user.clone();
        for ( i = 0; i < notifs.length; i++ ) {
          var type = notifs[i].value;
            if ( notifs[i].checked ) {
              while ( this.user.disabledTopics.includes(type) ) {
                  var index = this.user.disabledTopics.indexOf(type);
                  this.user.disabledTopics.splice(index, 1);
              }
            } else {
              if ( ! this.user.disabledTopics.includes(type) ) {
                this.user.disabledTopics.push(type);
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
        for ( i = 0; i < notifs.length; i++ ) {
          var type = notifs[i].value;
          if ( notifs[i].checked ) {
            while ( this.user.disabledTopicsEmail.includes(type) ) {
                var index = this.user.disabledTopicsEmail.indexOf(type);
                this.user.disabledTopicsEmail.splice(index, 1);
            }
          } else {
            if ( ! this.user.disabledTopicsEmail.includes(type) ) {
              this.user.disabledTopicsEmail.push(type);
            }
          }
        }
        this.userDAO.put(this.user);
        this.stack.push({ class: 'foam.nanos.notification.NotificationListView'});
      }
    }
  ]
});
