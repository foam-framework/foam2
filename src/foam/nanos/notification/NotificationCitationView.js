/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'NotificationCitationView',
  extends: 'foam.u2.View',

  axioms: [
    foam.pattern.Faceted.create()
  ],

  css: `
    ^ {
      line-height: 17px;
    }
    ^ .initiationDescription {
      font-family: IBMPlexSans;
      font-size: 14px;
      font-weight: 600;
      color: #1e1f21;
      margin-left: 16px;
    }
    ^ .created {
      font-family: IBMPlexSans;
      font-size: 11px;
      color: #5e6061;
      margin-left: 16px;
    }
    ^ .entity {
      font-family: IBMPlexSans;
      padding-left: 8px;
      padding-right: 8px;
      min-width: 84px;
      height: 20px;
      border-radius: 3px;
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0);
      background-color: #e7eaec;
      color: #5e6061;
      text-align: center;
      line-height: 20px;
      font-size: 12px;
      margin-left: 32px;
      display: inline-block;
    }
    ^ .description {
      font-family: IBMPlexSans;
      font-size: 14px;
      color: #1e1f21;
      margin-left: 32px;
      display: inline-block;
    }
    ^ .approvalStatus {
      font-family: IBMPlexSans;
      width: 94px;
      height: 20px;
      line-height: 20px;
      border-radius: 3px;
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0);
      background-color: #fbedec;
      font-size: 12px;
      text-align: center;
      color: #631414;
      float: right;
      margin-right: 145px;
      position: relative;
      bottom: 20;
    }
    ^ .initiationDescDiv {
      position: relative;
      top: 8;
      display: inline-block;
    }
  `,

  messages: [
    {
      name: 'NEEDS_APPROVAL_LABEL',
      message: 'Needs approval'
    }
  ],

  properties: [
    'of'
  ],

  methods: [
    function initE() {
      this.SUPER();
      
      // display notification type instead of initiationDescription if action or entity don't exist
      var initiationDescription = this.data.initiationDescription;
      if ( this.data.action == '' || this.data.entity == '' ) {
        initiationDescription = this.data.notificationType;
      }

      // truncate string if it is too long
      var description = this.data.description != '' ? this.data.description : this.data.body;
      if ( description != '' && description.length > 70 ) {
        description = description.substr(0, 70-1) + '...';
      }

      this
        .addClass(this.myClass())
        .start()
          .start().addClass('initiationDescDiv')
            .start().addClass('initiationDescription')
              .add(initiationDescription)
            .end()
            .start().addClass('created')
              .add(this.data.created.toUTCString())
            .end()
          .end()
          .start().addClass('entity')
            .show(this.data.entity != '').add(this.data.entity)
          .end()
          .start().addClass('description')
            .add(description)
          .end()
          .callIf(this.data.approvalStatus == 'REQUESTED', () => {
            this.start().addClass('approvalStatus')
              .add(this.NEEDS_APPROVAL_LABEL)
            .end();
          })
        .end();
    }
  ]
});
