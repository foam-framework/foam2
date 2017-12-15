foam.CLASS({
  package: 'foam.nanos.auth.forgotPassword',
  name: 'ResetView',
  extends: 'foam.u2.View',

  documentation: 'Forgot Password Reset View',
  
  imports: [
    'resetPasswordToken',
    'stack'
  ],

  exports: [
    'as data'
  ],

  requires: [
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage',
    

  ],

  css:`
    ^{
      width: 490px;
      margin: auto;
      
    }
    body{  
      background-color: #edf0f5;
    }
    ^ .Message-Container{
      width: 490px;
      height: 251px;
      border-radius: 2px;
      background-color: #ffffff;
      padding-top: 5px;
    }

    ^ .Reset-Password{
      width: 225;
      height: 30px;
      font-family: Roboto;
      font-size: 30px;
      font-weight: bold;
      line-height: 1;
      letter-spacing: 0.5px;
      text-align: left;
      color: #093649;
      margin-top: 20px;
      margin-bottom: 30px;
    }

    ^ p{
      display: inline-block;
    }

    ^ .newPassword-Text{
      width: 182px;
      height: 16px;
      font-family: Roboto;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      margin-top: 15px;
      margin-left: 20px;
      margin-right: 288px;
      margin-bottom: 5px;
    }

    ^ .confirmPassword-Text{
      width: 182px;
      height: 16px;
      font-family: Roboto;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      margin-left: 20px;
      margin-bottom: 5px;
      margin-top: 10px;
    }
    
    ^ .foam-u2-ActionView-confirm {
      width: 90%;
      height: 40px;
      border-radius: 2px;
      border: solid 1px #FFFFFF;
      margin: 0 auto;
      background-color: #59aadd;
      background: #59aadd;
      text-align: center;
      line-height: 35px;
      cursor: pointer;
      outline:none;
      color: #ffffff;
      margin-top: 10px;
      margin-left: 5%;
    }

    

    ^ .foam-u2-ActionView-confirm:hover {
      background: none;
      cursor: pointer;
      background-color: #59aadd;
    }

    ^ .link{
      margin-left: 2px;
      color: #59a5d5;
      cursor: pointer;
    }
    ^ .full-width-input{
      width: 90%;
      height: 40px;
      margin-left: 5%;
      margin-bottom: 15px;
      outline: none;
      padding: 10px;
    }
  `,
  

  properties: [
    {
      class: 'String',
      name: 'token',
      factory: function () {
        var search = /([^&=]+)=?([^&]*)/g;
        var query  = window.location.search.substring(1);

        var decode = function (s) {
          return decodeURIComponent(s.replace(/\+/g, ' '));
        };

        var params = {};
        var match;

        while ( match = search.exec(query) ) {
          params[decode(match[1])] = decode(match[2]);
        }

        return params.token || null;
      }
    },
    {
      class: 'String',
      name: 'newPassword',
      view: 'foam.u2.view.PasswordView'
    },
    {
      class: 'String',
      name: 'confirmPassword',
      view: 'foam.u2.view.PasswordView'
    }
  ],

  methods: [
    function initE(){
    this.SUPER();
    var self = this;

    this
      .addClass(this.myClass())
      .start().addClass('Background')
        .start().addClass('Reset-Password').add("Reset Password").end()
        .start().addClass('Message-Container')
          .start().addClass('newPassword-Text').add("New Password").end()
          .start(this.NEW_PASSWORD).addClass('full-width-input').end()
          .start().addClass('confirmPassword-Text').add("Confirm Password").end()
          .start(this.CONFIRM_PASSWORD).addClass('full-width-input').end()
          .start('div')
            .tag(this.CONFIRM, { showLabel: true })
          .end()
        .end()
        .start('p').add("Remember your password?").end()
        .start('p').addClass('link')
          .add('Sign in.')
          .on('click', function(){ self.stack.push({ class: 'foam.nanos.auth.SignInView' })})
        .end()
      .end()
    }
  ],

  messages: [
    { name: 'noSpaces', message: 'Password cannot contain spaces' },
    { name: 'noNumbers', message: 'Password must have one numeric character' },
    { name: 'noSpecial', message: 'Password must not contain: !@#$%^&*()_+' },
    { name: 'emptyPassword', message: 'Please enter new your password' },
    { name: 'emptyConfirmation', message: 'Please re-enter your new password' },
    { name: 'invalidLength', message: 'Password must be 7-32 characters long' },
    { name: 'passwordMismatch', message: 'Passwords do not match' }
  ],

  actions: [
    {
      name: 'confirm',
      label: 'Confirm',
      code: function (X, obj) {
        var self = this;
        this.resetPasswordToken.processToken(user, this.token).then(function (result) {
          self.stack.push({ class: 'foam.nanos.auth.forgotPassword.SuccessView' });
        }).catch(function (err) {
          self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
        });
        // check if new password entered
        if ( ! this.newPassword ) {
          this.add(this.NotificationMessage.create({ message: this.emptyPassword, type: 'error' }));
          return;
        }

        if ( this.newPassword.includes(' ') ) {
          this.add(this.NotificationMessage.create({ message: this.noSpaces, type: 'error' }));
          return;
        }

        if ( this.newPassword.length < 7 || this.newPassword.length > 32 ) {
          this.add(this.NotificationMessage.create({ message: this.invalidLength, type: 'error' }));
          return;
        }

        if ( ! /\d/g.test(this.newPassword) ) {
          this.add(self.NotificationMessage.create({ message: this.noNumbers, type: 'error' }));
          return;
        }

        if ( /[^a-zA-Z0-9]/.test(this.newPassword) ) {
          this.add(self.NotificationMessage.create({ message: this.noSpecial, type: 'error' }));
          return;
        }

        // check if confirm password entered
        if ( ! this.confirmPassword ) {
          this.add(self.NotificationMessage.create({ message: this.emptyConfirmation, type: 'error' }));
          return;
        }

        // check if passwords match
        if ( ! this.confirmPassword.trim() || this.confirmPassword !== this.newPassword ) {
          this.add(self.NotificationMessage.create({ message: this.passwordMismatch, type: 'error' }));
          return;
        }

        var user = this.User.create({
          password: this.newPassword
        });

        this.resetPasswordToken.processToken(user, this.token).then(function (result) {
          self.stack.push({ class: 'foam.nanos.auth.forgotPassword.SuccessView' });
        }).catch(function (err) {
          self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
        });
      }
    }
  ]
});
