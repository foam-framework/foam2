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
  // extends: 'foam.u2.detail.AbstractSectionedDetailView',

  documentation: `Change Password View: managing two states.
  State one) ResetPassword:  redirect from email link, with a token to update forgotten password,
  State two) UpdatePassword: simple change of password by a logged in user. `,

  imports: [
    'auth',
    'resetPasswordToken',
    'theme',
    'stack',
    'user'
  ],

  requires: [
    'foam.nanos.auth.User',
    'foam.u2.detail.SectionView'
  ],

  css: `
    ^ .top-bar {
      width: 100%;
      height: 64px;
      border-bottom: solid 1px #e2e2e3
    }
    ^ .top-bar img {
      height: 25px;
      margin-top: 20px;
    }
  `,

  sections: [
    {
      name: 'resetPasswordSection',
      title: 'Reset your password',
      help: `Create a new password for your account.`
    }
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'verticle',
      hidden: true
    },
    {
      class: 'String',
      name: 'token',
      factory: function() {
        var searchParams = new URLSearchParams(location.search);
        return searchParams.get('token');
      },
      hidden: true
    },
    {
      class: 'Password',
      name: 'originalPassword',
      section: 'resetPasswordSection',
      view: {
        class: 'foam.u2.view.PasswordView',
        passwordIcon: true
      },
      visibilityExpression: function(token) {
        return ! token ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      },

    },
    {
      class: 'Password',
      name: 'newPassword',
      section: 'resetPasswordSection',
      view: {
        class: 'net.nanopay.ui.NewPasswordView',
        passwordIcon: true
      },
      minLength: 6
    },
    {
      class: 'Password',
      name: 'confirmationPassword',
      section: 'resetPasswordSection',
      view: {
        class: 'foam.u2.view.PasswordView',
        passwordIcon: true
      },
      validationPredicates: [
        {
          args: ['newPassword', 'confirmationPassword'],
          predicateFactory: function(e) {
            return e.EQ(
              foam.nanos.auth.ChangePasswordView.NEW_PASSWORD,
              foam.nanos.auth.ChangePasswordView.CONFIRMATION_PASSWORD);
          },
          errorString: 'Passwords do not match.'
        }
      ]
    }
  ],

  messages: [
    { name: 'SUCCESS_MSG', message: 'Your password was successfully updated.' }
  ],

  methods: [
    {
      name: 'reset_',
      code: function() {
        this.clearProperty('originalPassword');
        this.clearProperty('newPassword');
        this.clearProperty('confirmPassword');
      }
    },
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .startContext({ data: this })
          .start().addClass('top-bar')
            .start('img')
              .attr('src', this.theme.logo)
            .end()
          .end()
          .start(this.SectionView, {
            data: this,
            sectionName: 'resetPasswordSection'
          }).end()
          .startContext({ data: this })
            .start(this.UPDATE_PASSWORD).end()
            .start(this.RESET_PASSWORD).end()
          .endContext()
      .end();
      }
  ],

  actions: [
    {
      name: 'resetPassword',
      isAvailable: function() {
        return !! this.token;
      },
      code: function(X) {
        var user = this.User.create({
          desiredPassword: this.newPassword
        });
        this.resetPasswordToken.processToken(null, user, this.token)
        .then(function(_) {
          this.reset_();
          this.stack.push({ class: 'foam.nanos.auth.SignInView' });
          this.notify(this.SUCCESS_MSG);
        }).catch((err) => {
          this.notify(err.message, 'error');
        });
      }
    },
    {
      name: 'updatePassword',
      isAvailable: function() {
        return ! this.token;
      },
      code: function(X) {
        this.auth.updatePassword(null, this.originalPassword, this.newPassword)
        .then((result) => {
          this.user.copyFrom(result);
          this.reset_();
          this.notify(this.SUCCESS_MSG);
        })
        .catch((err) => {
          this.notify(err.message, 'error');
        });
      }
    }
  ]
});
