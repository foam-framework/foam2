/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.demos.net.nap.web',
  name: 'EditMessageboard',
  extends: 'foam.u2.View',

  documentation: 'Edit Messageboard Form',

  implements: [
  'foam.mlang.Expressions'
  ],

  requires: [
    'foam.demos.net.nap.web.model.Messageboard',
    'foam.nanos.fs.File',
  ],

  imports: [
    'stack',
    'messageboard',
    'messageboardDAO'
  ],

  exports: [
    'as view'
  ],

  css: `
    ^{
      width: 100%;
      margin: auto;
      background-color: #edf0f5;
    }
    ^ .net-nanopay-ui-ActionView-backAction {
      border-radius: 2px;
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      margin-right: 10px;
    }
    ^ .actions {
      width: 1240px;
      height: 40px;
      margin: 0 auto;
    }
    ^ .left-actions {
      display: inline-block;
      float: left;
    }
    ^ .net-nanopay-ui-ActionView-saveAction {
      float: right;
      border-radius: 2px;
      background-color: %SECONDARYCOLOR%;
      color: white;
      margin-top: 10px;
    }
    ^ .net-nanopay-ui-ActionView-saveAction:hover {
      background: %SECONDARYCOLOR%;
      opacity: 0.9;
    }
    ^ .net-nanopay-ui-ActionView-backAction {
      border-radius: 2px;
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      margin-top: 10px;
    }
    ^ .net-nanopay-ui-ActionView-backAction:hover {
      background: lightgray;
    }







    ^ .settingsBar {
      width: 100%;
      height: 40px;
      line-height: 40px;
      background-color: #FFFFFF;
      margin-bottom: 20px;
    }
    ^ .settingsBarContainer {
      width: 992px;
      margin: auto;
    }
    ^ .foam-u2-ActionView {
      opacity: 0.6;
      font-family: Roboto;
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.3px;
      color: #093649;
      padding: 0;
      padding-left: 30px;
      display: inline-block;
      cursor: pointer;
      margin: 0;
      border: none;
      background: transparent;
      outline: none;
      line-height: 40px;
    }
    ^ .foam-u2-ActionView-personalProfile {
      padding-left: 0;
    }
    ^ .foam-u2-ActionView:hover {
      background: white;
      opacity: 1;
    }
    ^ .editBusinessContainer {
      width: 992px;
      margin: auto;
    }
    ^ h2{
      opacity: 0.6;
      font-family: Roboto;
      font-size: 20px;
      font-weight: 300;
      line-height: 1;
      letter-spacing: 0.3px;
      text-align: left;
      color: #093649;
      margin-bottom: 50px;
    }
    ^registration-container{
      background: white;
      padding: 4px 25px;
      margin-bottom: 20px;
    }
    ^ h3{
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.2px;
    }
    ^ img{
      display: inline-block;
    }
    ^upload-button{
      display: inline-block;
      width: 135px;
      height: 40px;
      border-radius: 2px;
      background: white;
      border: solid 1px #59a5d5;
      color: #59a5d5;
      position: relative;
      top: -35;
      right: -40;
      font-size: 14px;
      cursor: pointer;
      outline: 0;
    }
    ^ p{
      font-size: 10px;
      color: #093649;
      font-weight: 300;
      display: inline-block;
      position: relative;
      right: 100;
    }
    ^ input{
      width: 100%;
      height: 40px;
      margin-top: 7px;
      padding: 10px;
    }
    ^ label{
      font-weight: 300;
      font-size: 14px;
      color: #093649;
    }
    .input-container{
      width: 46%;
      display: inline-block;
      margin-bottom: 20px;
      margin-right: 15px;
    }
    .input-container-quarter{
      width: 13%;
      display: inline-block;
      margin-bottom: 20px;
      margin-right: 15px;
    }
    .input-container-third{
      width: 30%;
      display: inline-block;
      margin-bottom: 20px;
      margin-right: 15px;
    }
    .dropdown{
      width: 200px;
      height: 200px;
      background: black;
    }
    ^ .foam-u2-tag-Select{
      height: 40px;
      width: 100%;
      background: white;
      border: 1px solid lightgrey;
      margin-top: 5px;
    }
    ^ .foam-u2-ActionView-saveBusiness{
      width: 100%;
      height: 40px;
      background: #59aadd;
      margin-bottom: 15px;
      outline: 0;
      border: 0;
      font-size: 14px;
      color: white;
      cursor: pointer;
      opacity: 1;
    }
    ^ .foam-u2-ActionView-saveBusiness:hover {
      background-color: #59aadd;
    }
    ^ .net-nanopay-ui-ActionView-closeButton {
      width: 24px;
      height: 35px;
      margin: 0;
      cursor: pointer;
      display: inline-block;
      float: right;
      outline: 0;
      border: none;
      background: transparent;
      box-shadow: none;
      padding-top: 15px;
      margin-right: 15px;
    }
    ^ .net-nanopay-ui-ActionView-closeButton:hover {
      background: transparent;
      background-color: transparent;
    }
    ^ .input-companytype-width select {
      width: 100% !important;
    }

    ^ .input-businesssector-width select {
      width: 100% !important;
    }
    ^ .input-businesssector-width select {
      width: 100% !important;
    }
    ^ .business-image-container {
      padding-bottom: 20px;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      //this.data = this.messageboard;

      this
        .addClass(this.myClass())
        .start().addClass('actions')
          .start().addClass('left-actions')
            .start(this.BACK_ACTION).end()
            .start(this.SAVE_ACTION).end()
          .end()
            .start('table').addClass('tableView')
              .start('tr')
                .start('td').add('Id').end()
                .start('td').add(this.data.ID).end()
              .end()
              .start('tr')
                .start('td').add('Title').end()
                .start('td').add(this.data.TITLE).end()
              .end()
              .start('tr')
                .start('td').add('Date').end()
                .start('td').add(this.data.CREATED_DATE).end()
              .end()
              .start('tr')
                .start('td').add('Creator').end()
                .start('td').add(this.data.CREATOR).end()
              .end()
              .start('tr')
                .start('td').add('Content').end()
                .start('td').add(this.data.CONTENT).end()
              .end()
              //.start().add(this.UPLOAD_BUTTON, { showLabel:true }).end()
            .end()
            .end();
    }
  ],

  actions: [
    {
      name: 'saveAction',
      label: 'Save',
      code: function(X) {
        var self = this;

        // if (!this.data.amount || this.data.amount < 0){
        //   this.add(foam.u2.dialog.NotificationMessage.create({ message: 'Please Enter Amount.', type: 'error' }));
        //   return;
        // }

        // var message = self.Messageboard.create({
        //   id : this.data.id,
        //   title: this.data.title,
        //   content: this.data.content,
        //   creator : this.data.creator,
        //   createdDate : this.data.createdDate
        // });

        X.messageboardDAO.put(this).then(function() {
          //this.message = message;
          X.stack.push({ class: 'foam.demos.net.nap.web.MessageboardList' });
        });
      }
    },
    {
      name: 'backAction',
      label: 'Back',
      code: function(X){
        X.stack.back();
        //alert("1 : " + this.stack);
        //this.stack.push({ class: 'foam.demos.net.nap.web.MessageboardList' });
        //this.stack.back();
      }
    }
  ]

});
