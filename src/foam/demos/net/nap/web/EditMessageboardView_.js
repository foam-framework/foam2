/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.demos.net.nap.web',
  name: 'EditMessageboardView_',
  extends: 'foam.u2.Controller',

  documentation: '',

  requires: [
    'foam.demos.net.nap.web.model.messageboard'
  ],

  imports: [
    'stack',
    'messageboardDAO'
  ],

  css: `
    ^ {
      width: 540px;
      margin: 0 auto;
    }
    ^ .nameContainer {
      position: relative;
      width: 540px;
      height: 64px;
      overflow: hidden;
      box-sizing: border-box;
    }
    ^ .label {
      font-size: 14px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      margin-left: 0;
    }
    ^ .nameDisplayContainer {
      position: absolute;
      top: 0;
      left: 0;
      width: 540px;
      height: 64px;
      opacity: 1;
      box-sizing: border-box;
      transition: all 0.15s linear;
      z-index: 10;
    }
    ^ .nameDisplayContainer.hidden {
      left: 540px;
      opacity: 0;
    }
    ^ .nameDisplayContainer p {
      margin: 0;
      margin-bottom: 8px;
    }
    ^ .legalNameDisplayField {
      width: 100%;
      height: 40px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5) !important;
      padding: 12px 13px;
      box-sizing: border-box;
    }
    ^ .nameInputContainer {
      position: absolute;
      top: 0;
      left: 0;
      width: 540px;
      height: 64px;
      opacity: 1;
      box-sizing: border-box;
      z-index: 9;
    }
    ^ .nameInputContainer.hidden {
      pointer-events: none;
      opacity: 0;
    }
    ^ .phoneFieldsCol {
      display: inline-block;
      vertical-align: middle;
      height: 64px;
      opacity: 1;
      box-sizing: border-box;
      margin-right: 20px;
      transition: all 0.15s linear;
    }
    ^ .nameFieldsCol {
      display: inline-block;
      vertical-align: middle;
      /* 100% minus 2x 20px padding equally divided by 3 fields */
      width: calc((100% - 40px) / 3);
      height: 64px;
      opacity: 1;
      box-sizing: border-box;
      margin-right: 20px;
      transition: all 0.15s linear;
    }
    ^ .nameFieldsCol:last-child {
      margin-right: 0;
    }
    ^ .nameFieldsCol p {
      margin: 0;
      margin-bottom: 8px;
    }
    ^ .nameFieldsCol.firstName {
      opacity: 0;
      // transform: translateX(64px);//translateX(-166.66px);
    }
    ^ .nameFieldsCol.middleName {
      opacity: 0;
      transform: translateX(-166.66px);//translateX(64px);
    }
    ^ .nameFieldsCol.lastName {
      opacity: 0;
      transform: translateX(-166.66px);//translateY(64px);//translateX(166.66px);
    }
    ^ .nameFields {
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      padding: 12px 13px;
      width: 100%;
      height: 40px;
      box-sizing: border-box;
      outline: none;
    }
    ^ .largeInput {
      width: 540px;
      height: 40px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      padding: 12px;
      font-size: 12px;
      color: #093649;
      outline: none;
    }
    ^ .marginLeft {
      margin-left: 20px;
    }
    ^ .countryCodeInput {
      width: 105px;
      height: 40px;
      border: solid 1px rgba(164, 179, 184, 0.5);
      padding: 12px;
      font-size: 12px;
      color: #093649;
      outline: none;
    }
    ^ .phoneNumberInput {
      width: 415px;
      height: 40px;
      border: solid 1px rgba(164, 179, 184, 0.5);
      padding: 12px;
      font-size: 12px;
      color: #093649;
      outline: none;
    }
    ^ .buttonDiv {
      width: 100%;
      height: 60px;
      background-color: #edf0f5;
      position: relative;
      bottom: 0;
      z-index: 200;
    }
    ^ .net-nanopay-ui-ActionView-closeButton {
      border-radius: 2px;
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      margin-top: 30px;
    }
    ^ .net-nanopay-ui-ActionView-closeButton:hover {
      background: lightgray;
    }
    ^ .net-nanopay-ui-ActionView-saveButton {
      float: right;
      border-radius: 2px;
      background-color: %SECONDARYCOLOR%;
      color: white;
      margin-top: 30px;
    }
    ^ .net-nanopay-ui-ActionView-saveButton:hover {
      background: %SECONDARYCOLOR%;
      opacity: 0.9;
    }
    ^ .property-confirmEmailAddress {
      margin-bottom: 10px;
    }
    ^ .readOnly {
      color: #a4b3b8;
    }
  `,

  properties: [
    'data',
    {
      class: 'Boolean',
      name: 'isEditingName',
      value: false
    },
    {
      class: 'Boolean',
      name: 'isEditingPhone',
      value: false,
      postSet: function (oldValue, newValue) {
        this.displayedPhoneNumber = '';
        if ( this.countryCode ) this.displayedPhoneNumber += this.countryCode;
        if ( this.data.phone.number ) this.displayedPhoneNumber += ' ' + this.data.phone.number;
      }
    },
    {
      class: 'String',
      name: 'displayedPhoneNumber',
      value: '+1'
    },
    {
      class: 'String',
      name: 'countryCode',
      value: '+1'
    }
  ],

  messages: [
    { name: 'Title', message: 'Edit Business Profile' },
    { name: 'Subtitle', message: 'Account ID' },
    { name: 'LegalNameLabel', message: 'Legal Name' },
    { name: 'FirstNameLabel', message: 'First Name' },
    { name: 'MiddleNameLabel', message: 'Middle Initials (optional)' },
    { name: 'LastNameLabel', message: 'Last Name' },
    { name: 'JobTitleLabel', message: 'Job Title' },
    { name: 'EmailLabel', message: 'Email Address' },
    { name: 'CountryCodeLabel', message: 'Country Code' },
    { name: 'PhoneNumberLabel', message: 'Phone Number' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start('h1').add(this.Title).end()
        .start('h3').add(this.Subtitle + ' ' + this.data.id).end()
        .start('div').addClass('nameContainer')
          .start('div').addClass('nameDisplayContainer')
            .enableClass('hidden', this.isEditingName$)
            .start('p').add(this.LegalNameLabel).addClass('infoLabel').end()
            .start(this.User.LEGAL_NAME, { data$: this.data.legalName$, tabIndex: 1 })
              .addClass('legalNameDisplayField')
              .on('focus', function () {
                this.blur();
                self.isEditingName = true;
                this.isEditingPhone = false;
              })
            .end()
          .end()
          .start('div').addClass('nameInputContainer')
            .enableClass('hidden', this.isEditingName$, true)
            .start('div').addClass('nameFieldsCol')
              .enableClass('firstName', this.isEditingName$, true)
              .start('p').addClass('infoLabel').add(this.FirstNameLabel).end()
              .start(this.User.FIRST_NAME, { data$: this.data.firstName$, tabIndex: 2 })
                .addClass('nameFields')
                .on('click', function () {
                  self.isEditingName = true;
                })
              .end()
            .end()
            .start('div').addClass('nameFieldsCol')
              .enableClass('middleName', this.isEditingName$, true)
              .start('p').addClass('infoLabel').add(this.MiddleNameLabel).end()
              .start(this.User.MIDDLE_NAME, { data$: this.data.middleName$, tabIndex: 3 })
                .addClass('nameFields')
                .on('click', function () {
                  self.isEditingName = true;
                })
              .end()
            .end()
            .start('div').addClass('nameFieldsCol')
              .enableClass('lastName', this.isEditingName$, true)
              .start('p').addClass('infoLabel').add(this.LastNameLabel).end()
              .start(this.User.LAST_NAME, { data$: this.data.lastName$, tabIndex: 4 })
                .addClass('nameFields')
                .on('click', function () {
                  self.isEditingName = true;
                })
              .end()
            .end()
          .end()
        .end()
        .start('div').style({ 'padding-bottom': '12px' })
          .on('click', function () {
            self.isEditingName = false;
            self.isEditingPhone = false;
          })
          .start()
            .start('p').addClass('label').add(this.JobTitleLabel).end()
            .start(this.User.JOB_TITLE, { data$: this.data.jobTitle$ })
              .addClass('largeInput')
              .on('focus', function () {
                self.isEditingName = false;
                self.isEditingPhone = false;
              })
            .end()
          .end()
          .start()
            .start('p').addClass('label').add(this.EmailLabel).end()
            .start(this.User.EMAIL, { data$: this.data.email$, mode: foam.u2.DisplayMode.RO })
              .addClass('largeInput readOnly')
              .on('focus', function () {
                self.isEditingName = false;
                self.isEditingPhone = false;
              })
            .end()
          .end()
        .end()
        .start()
          .addClass('nameContainer')
          .start()
            .addClass('nameDisplayContainer')
            .enableClass('hidden', this.isEditingPhone$)
            .start('p').add(this.PhoneNumberLabel).addClass('label').end()
            .start(this.DISPLAYED_PHONE_NUMBER)
              .addClass('legalNameDisplayField')
              .on('focus', function() {
                this.blur();
                self.isEditingName = false;
                self.isEditingPhone = true;
              })
            .end()
          .end()
          .start('div')
            .addClass('nameInputContainer')
            .enableClass('hidden', this.isEditingPhone$, true)
            .start('div')
              .addClass('phoneFieldsCol')
              .enableClass('firstName', this.isEditingPhone$, true)
              .start().add(this.CountryCodeLabel).addClass('label').end()
              .start(this.COUNTRY_CODE, { mode: foam.u2.DisplayMode.RO })
                .addClass('countryCodeInput')
                .on('click', function() {
                  self.isEditingPhone = true;
                })
              .end()
            .end()
            .start('div')
              .addClass('nameFieldsCol')
              .enableClass('middleName', this.isEditingPhone$, true)
              .start('p').add(this.PhoneNumberLabel).addClass('label').end()
              .start(this.User.PHONE_NUMBER, { data$: this.data.phone.number$ })
                .addClass('phoneNumberInput')
                .on('click', function() {
                  self.isEditingPhone = true;
                })
              .end()
            .end()
          .end()
        .end()
        .start().addClass('buttonDiv')
          .start(this.CLOSE_BUTTON).end()
          .start(this.SAVE_BUTTON).end()
        .end()
    },

    function validations() {
      if ( ! this.data.firstName || ! this.data.lastName || ! this.data.jobTitle || ! this.data.phone || ! this.data.phone.number ) {
        this.add(this.NotificationMessage.create({ message: 'Please fill out all necessary fields before proceeding.', type: 'error' }));
        return false;
      }
      if ( this.data.firstName.length > 70 ) {
        this.add(this.NotificationMessage.create({ message: 'First name cannot exceed 70 characters.', type: 'error' }));
        return false;
      }
      if ( /\d/.test(this.data.firstName) ) {
        this.add(this.NotificationMessage.create({ message: 'First name cannot contain numbers', type: 'error' }));
        return false;
      }
      if ( this.data.middleName ) {
        if ( this.data.middleName.length > 70 ) {
          this.add(this.NotificationMessage.create({ message: 'Middle initials cannot exceed 70 characters.', type: 'error' }));
          return false;
        }
        if ( /\d/.test(this.data.middleName) ) {
          this.add(this.NotificationMessage.create({ message: 'Middle initials cannot contain numbers', type: 'error' }));
          return false;
        }
      }
      if ( this.data.lastName.length > 70 ) {
        this.add(this.NotificationMessage.create({ message: 'Last name cannot exceed 70 characters.', type: 'error' }));
        return false;
      }
      if ( /\d/.test(this.data.lastName) ) {
        this.add(this.NotificationMessage.create({ message: 'Last name cannot contain numbers.', type: 'error' }));
        return false;
      }
      if ( ! this.validateTitleNumOrAuth(this.data.jobTitle) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid job title.', type: 'error' }));
        return false;
      }
      if ( ! this.validatePhone(this.countryCode + ' ' + this.data.phone.number) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid phone number.', type: 'error' }));
        return false;
      }
      return true;
    }
  ],

  actions: [
    {
      name: 'closeButton',
      label: 'Close',
      code: function (X) {
        this.stack.back();
      }
    },
    {
      name: 'saveButton',
      label: 'Save',
      code: function (X) {
        var self = this;
        if ( ! this.validations() ) {
          return;
        }

        this.userDAO.put(this.data).then(function (result) {
          self.add(self.NotificationMessage.create({ message: 'Successfully updated business profile.' }));
          self.stack.back();
        })
        .catch(function (err) {
          self.add(self.NotificationMessage.create({ message: 'Error updating business profile.', type: 'error' }));
        });
      }
    }
  ]
});
