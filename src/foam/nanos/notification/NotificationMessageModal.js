/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
    package: 'foam.nanos.notification',
    name: 'NotificationMessageModal',
    extends: 'foam.u2.View',
  
    documentation: 'View for displaying notification message',

    css: `
      ^ {
        background-color: #fff;
        width: 60vw;
        max-height: 80vh;
        padding: 24px;
        overflow-y: scroll;
      }
      ^ .main {
        padding: 8px 24px 0px;
      }
      ^ .bold-label {
        font-size: 16px;
        font-weight: bold;
        padding-bottom: 8px;
      } 
    `,

    requires: [
      'foam.u2.layout.Rows',
      'foam.u2.layout.Grid',
      'foam.u2.ModalHeader'
    ],

    messages: [
      { name: 'NATIFICATION_MSG', message: 'Notification' },
      { name: 'CREATED_MSG', message: 'Created' },
      { name: 'MESSAGE_MSG', message: 'Message' }
    ],
  
    properties: [
      'data',
      'created',
      'description'
    ],
  
    methods: [
      function initE() {
        this.SUPER();

        this.created = this.data.created.toUTCString();
        this.description = this.data.body;
        
        this
        .addClass(this.myClass())
        .tag(this.ModalHeader.create({
          title: this.NATIFICATION_MSG
        }))
        .start()
          .addClass('main')
            .start(this.Rows).style({padding: '24px 0px'})
              .start().addClass('bold-label').add(this.CREATED_MSG).end()
              .start().add(this.created).end()
            .end()
            .start(this.Rows).style({padding: '24px 0px'})
              .start().addClass('bold-label').add(this.MESSAGE_MSG).end()
              .start().add(this.description).end()
            .end()
        .end();
      }
    ]
  });
