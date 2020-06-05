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
      'foam.u2.view.OverlayActionListView',
      'foam.u2.dialog.NotificationMessage'
    ],

    imports: [
      'summaryView?',
      'invoiceDAO',
      'notificationDAO',
      'stack',
      'user',
      'userDAO',
      'ctrl'
    ],

    exports: [
      'as rowView'
    ],

    topics: [
      'finished',
      'throwError'
    ],

    css: `
      ^ {
        position: relative;
        padding: 8px;
        margin-right: 32px;
      }
      ^ .foam-u2-view-OverlayActionListView {
        position: absolute;
        top: 20px;
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
      ^ .notificationDiv {
        display: flex;
        flex-direction: row;
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
          .start().addClass('notificationDiv')
            .tag(this.NotificationCitationView, {
              of: this.data.cls_,
              data: this.data
            })
            .tag(this.OverlayActionListView, {
              data: [
                this.MARK_AS_READ,
                this.MARK_AS_UNREAD,
                this.HIDE_NOTIFICATION_TYPE,
                this.REMOVE_NOTIFICATION
              ],
              obj: this.data
            })
          .end();
      }
    ],

    actions: [
      {
        name: 'removeNotification',
        code: function(X) {
          var self = X.rowView;
          self.notificationDAO.remove(self.data).then(_ => {
            self.finished.pub();
            if ( self.summaryView && foam.u2.GroupingDAOList.isInstance(self.summaryView) ){
              self.summaryView.update();
            } else {
              self.stack.push({
                class: 'foam.nanos.notification.NotificationView'
              });
            }
          })
        },
        confirmationRequired: true
      },
      function hideNotificationType(X) {
        var self = X.rowView;

        if ( self.user.disabledTopics.includes(self.data.notificationType) ){
          self.ctrl.add(self.NotificationMessage.create({
            message: "Disabled already exists for this notification something went wrong",
            type: 'error'
          }));

          return;
        }

        var userClone = self.user.clone();

        // check if disabledTopic already exists
        userClone.disabledTopics.push(self.data.notificationType);
        self.userDAO.put(userClone).then(user => {
          self.finished.pub();
          self.user = user;
          
          if ( self.summaryView && foam.u2.GroupingDAOList.isInstance(self.summaryView) ){
            self.summaryView.update();
          } else {
            self.stack.push({
              class: 'foam.nanos.notification.NotificationView'
            });
          }
        }).catch(e => {
          self.throwError.pub(e);

          // TODO: uncomment this once we wire up a proper exception
          // if ( foam.comics.v2.userfeedback.UserFeedbackException.isInstance(e) && e.userFeedback  ){
          //   var currentFeedback = e.userFeedback;
          //   while ( currentFeedback ){
          //     self.ctrl.add(self.NotificationMessage.create({
          //       message: currentFeedback.message,
          //       type: currentFeedback.status.name.toLowerCase()
          //     }));

          //     currentFeedback = currentFeedback.next;
          //   }
          // } else {
          //   self.ctrl.add(self.NotificationMessage.create({
          //     message: e.message,
          //     type: 'error'
          //   }));
          // }

          if ( e.message === 'An approval request has been sent out.' ) {
            self.ctrl.add(self.NotificationMessage.create({
              message: e.message,
              type: 'success'
            }));
          } else {
            self.ctrl.add(self.NotificationMessage.create({
              message: e.message,
              type: 'error'
            }));
          }
        })
      },
      {
        name: 'markAsRead',
        isAvailable: (read) => {
          return ! read;
        },
        code: function(X) {
          var self = X.rowView;
          if ( ! self.data.read ) {
            self.data.read = true;
            self.notificationDAO.put(self.data).then(_ => {
              self.finished.pub();
              if ( self.summaryView && foam.u2.GroupingDAOList.isInstance(self.summaryView) ){
                self.summaryView.update();
              } else {
                self.stack.push({
                  class: 'foam.nanos.notification.NotificationView'
                });
              }
            });
          }
        }
      },
      {
        name: 'markAsUnread',
        isAvailable: (read) => {
          return read;
        },
        code: function(X) {
          var self = X.rowView;
          if ( self.data.read ) {
            self.data.read = false;
            self.notificationDAO.put(self.data).then(_ => {
              self.finished.pub();
              if ( self.summaryView && foam.u2.GroupingDAOList.isInstance(self.summaryView) ){
                self.summaryView.update();
              } else {
                self.stack.push({
                  class: 'foam.nanos.notification.NotificationView'
                });
              }
            })
          }
        }
      }
    ]
  });
