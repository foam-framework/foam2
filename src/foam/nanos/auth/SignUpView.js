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
  name: 'SignUpView',
  extends: 'foam.u2.View',

  documentation: 'User Registration View',

  imports: [
    'emailUserRegistration',
    'save',
    'stack',
    'user',
    'userDAO'
  ],

  exports: [
    'as data'
  ],

  requires: [
    'foam.nanos.auth.User'
  ],

  css: `
        ^{
          width: 490px;
          margin: auto;
        }
        ^ .registration-container{
          background: white;
          padding: 25px 25px 25px;
        }
        ^ h2{
          height: 30px;
          font-size: 30px;
          font-weight: bold;
          line-height: 1;
          letter-spacing: 0.5px;
          text-align: left;
          color: #093649;
          margin-top: 20px;
          margin-bottom: 30px;
        }
        ^ h3{
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 0.2px;
        }
        ^ p{
          display: inline-block;
        }
        .link{
          margin-left: 2px;
          color: #59a5d5;
          cursor: pointer;
        }
        ^ input{
          width: 100%;
          height: 40px;
          margin-top: 7px;
          padding: 10px;
          outline: none;
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
        ^ .input-container-right {
          width: 46%;
          display: inline-block;
          margin-bottom:20px;
          float: right;
        }
        .input-container-full-width{
          width: 100%;
          display: inline-block;
          margin-bottom: 20px;
          margin-right: 15px;
        }
        ^ .check-box{
          display: inline-block;
          border: solid 1px rgba(164, 179, 184, 0.5);
          width: 14px;
          height: 14px;
          border-radius: 2px;
          margin-right: 10px;
          position: relative;
          top: 5;
        }
        ^ img{
          display: none;
        }
        .agreed{
          background: black;
        }
        .show-checkmark img{
          width: 15px;
          position: relative;
          display: block;
        }
        ^ .foam-u2-ActionView-signUp{
          position: relative;
          width: 100%;
          height: 40px;
          background: none;
          background-color: #59a5d5;
          font-size: 14px;
          border: none;
          color: white;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
          filter: grayscale(0%);
        }
        ^ .foam-u2-ActionView-signUp:hover{
          background: none;
          background-color: #3783b3;
        }
        ^ .property-password {
          -webkit-text-security: disc;
          -moz-text-security: disc;
          text-security: disc;
        }
  `,

  properties: [
    {
      name: 'firstName'
    },
    {
      name: 'lastName'
    },
    {
      name: 'email'
    },
    {
      name: 'password'
    },
    {
      name: 'agreed'
    },
    'organization',
    'department',
    'phone'
  ],

  methods: [
    function initE(){
      this.SUPER();
      this.agreed = false;
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .start('h1').add('Sign Up').end()
          .start().addClass('registration-container')
            .start().addClass('business-registration-input')
              .start().addClass('input-container')
                .start('label').add('First Name').end()
                  .add(this.FIRST_NAME)
              .end()
              .start().addClass('input-container-right')
                .start('label').add('Last Name').end()
                  .add(this.LAST_NAME)
              .end()
              .start().addClass('input-container')
                .start('label').add('Company Name').end()
                  .add(this.ORGANIZATION)
              .end()
              .start().addClass('input-container-right')
                .start('label').add('Job Title').end()
                  .add(this.DEPARTMENT)
              .end()
              .start().addClass('input-container')
                .start('label').add('Email Address').end()
                  .add(this.EMAIL)
              .end()
              .start().addClass('input-container-right')
                .start('label').add('Phone Number').end()
                  .add(this.PHONE)
              .end()
              .start().addClass('input-container-full-width')
                .start('label').add('Password').end()
                  .add(this.PASSWORD)
              .end()
            .end()
            .start().addClass('term-conditions')
              // .start('div').addClass('check-box').enableClass('agreed', this.agreed$).on('click', function(){ self.agreed = !self.agreed })
              //   .tag({class:'foam.u2.tag.Image', data: 'images/check-mark.png'}).enableClass('show-checkmark', this.agreed$)
              // .end()
              // .start('p').add('I agree with the ').end()
              // .start('p').addClass('link').add('terms and conditions.').end()
              .start().add(this.SIGN_UP).end()
            .end()
          .end()
          .start('p').add('Already have an account?').end()
          .start('p').addClass('link')
            .add('Sign in.')
            .on('click', function(){ self.stack.push({ class: 'foam.nanos.auth.SignInView' }) })
          .end()
        .end()
      .end()
    },
  ],

  actions: [
    {
      name: 'signUp',
      isEnabled: function(firstName, lastName, email, password){
        return firstName && lastName && email && password;
      },
      code: function (X, obj) {
        var self = this;
        var user = self.User.create({
          firstName: self.firstName,
          lastName: self.lastName,
          email: self.email,
          phone: self.phone,
          desiredPassword: self.password,
          organization: self.organization,
          department: self.department
        });

        this.userDAO.put(user).then(function(user){
          self.user = user;
          X.stack.push({ class: 'foam.nanos.auth.SignInView' });
        });
      }
    }
  ]
});
