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
  package: 'foam.nanos.auth',
  name: 'ChangePasswordView',
  extends: 'foam.u2.View',

  documentation: 'Change Password View',

  imports: [
    'auth',
    'user',
    'stack',
    'userDAO'
  ],
  exports: [ 'as data' ],

  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],

  css: `
    ^ {
      width: 1280px;
      margin: auto;
    }
    ^ .Container{
      width: 960px;
      height: 200px;
      border-radius: 2px;
      background-color: #ffffff;
      margin-left: 160px;
      margin-top: 50px;
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
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .originalPass-Text{
      width: 118px;
      height: 16px;
      margin-bottom: 8px;
      margin-left: 20px;
      margin-right: 195px;
    }
    ^ .newPass-Text{
      width: 118px;
      height: 16px;
      margin-right: 195px;
    }
    ^ .confirmPass-Text{
      width: 119px;
      height: 16px;
    }
    ^ .originalPass-Input{
      width: 293px;
      height: 40px;
      margin-left: 20px;
      margin-right: 20px;
    }
    ^ .newPass-Input{
      width: 293px;
      height: 40px;
      margin-right: 20px;
    }
    ^ .confirmPass-Input{
      width: 294px;
      height: 40px;
    }
    ^ .changePass-Text{
      width: 164px;
      height: 20px;
      margin-left: 20px;
      margin-right: 621px;
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
      border: 1px solid /*%PRIMARY3%*/ #406dea;
      background-color: /*%PRIMARY3%*/ #406dea;
      margin-left: 20px;
      margin-top: 19px;
    }
    ^ .update-BTN:hover {
      border: 1px solid /*%PRIMARY3%*/ #406dea;
      opacity: 0.9;
    }
    ^ h1{
      opacity: 0.6;
      font-family: Roboto;
      font-size: 20px;
      font-weight: 300;
      line-height: 1;
      letter-spacing: 0.3px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      display: inline-block;
    }
    ^ h2{
      width: 150px;
      font-family: Roboto;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      display: inline-block;
    }
  `,

  messages: [
    { name: 'emptyOriginal', message: 'Please enter your original password'},
    { name: 'emptyPassword', message: 'Please enter your new password' },
    { name: 'emptyConfirmation', message: 'Please re-enter your new password' },
    { name: 'passwordMismatch', message: 'Passwords do not match' },
    { name: 'passwordSuccess', message: 'Password successfully updated' }
  ],

  properties: [
    {
      class: 'String',
      name: 'originalPassword',
      view: { class: 'foam.u2.view.PasswordView' }
    },
    {
      class: 'String',
      name: 'newPassword',
      view: { class: 'foam.u2.view.PasswordView' }
    },
    {
      class: 'String',
      name: 'confirmPassword',
      view: { class: 'foam.u2.view.PasswordView' }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
      .addClass(this.myClass())
      .start().addClass('Container')
        .start('div')
          .start('h1').add('Change Password').addClass('changePass-Text').end()
        .end()
        .start('div')
          .start('h2').add('Original Password').addClass('originalPass-Text').end()
          .start('h2').add('New Password').addClass('newPass-Text').end()
          .start('h2').add('Confirm Password').addClass('confirmPass-Text').end()
        .end()
        .start('div')
          .start(this.ORIGINAL_PASSWORD).addClass('originalPass-Input').end()
          .start(this.NEW_PASSWORD).addClass('newPass-Input').end()
          .start(this.CONFIRM_PASSWORD).addClass('confirmPass-Input').end()
        .end()
        .start(this.UPDATE_PASSWORD).addClass('update-BTN').end()
      .end()
    }
  ],

  actions: [
   {
      name: 'updatePassword',
      label: 'Update',
      code: function(X) {
        var self = this;

        // check if original password entered
        if ( ! this.originalPassword ) {
          this.add(this.NotificationMessage.create({ message: this.emptyOriginal, type: 'error' }));
          return;
        }

        // check if new password entered
        if ( ! this.newPassword ) {
          this.add(this.NotificationMessage.create({ message: this.emptyPassword, type: 'error' }));
          return;
        }

        // check if new password confirmation entered
        if ( ! this.confirmPassword ) {
          this.add(self.NotificationMessage.create({ message: this.emptyConfirmation, type: 'error' }));
          return;
        }

        // check if passwords match
        if ( ! this.confirmPassword.trim() || this.confirmPassword !== this.newPassword ) {
          this.add(self.NotificationMessage.create({ message: this.passwordMismatch, type: 'error' }));
          return;
        }

        // update password
        this.auth.updatePassword(null, this.originalPassword, this.newPassword).then(function(result) {
          // copy new user, clear password fields, show success
          self.user.copyFrom(result);
          self.originalPassword = null;
          self.newPassword = null;
          self.confirmPassword = null;
          self.add(self.NotificationMessage.create({ message: self.passwordSuccess }));
        })
        .catch(function(err) {
          self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
        });
      }
    }
  ]
});
