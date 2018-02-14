foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ResendVerificationEmail',
  extends: 'foam.u2.Controller',

  documentation: 'Resend verification email view',

  requires: [
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'user'
  ],

  css:`
    ^{
      width: 490px;
      margin: auto;
    }
    ^ .container {
      width: 490px;
      height: 142px;
      border-radius: 2px;
      background-color: white;
      padding: 20px;
    }
    ^ .net-nanopay-ui-ActionView-resendEmail {
      width: 100%;
      height: 40px;
      background: white;
      border: solid 1px #59a5d5;
      display: inline-block;
      color: #59a5d5;
      margin-top: 35px;
      outline: none;
    }

  `,

  properties: [
    {
      class: 'String',
      name: 'email'
    }
  ],

  messages: [
    { name: 'Title', message: "You're almost there..." },
    { name: 'Instructions1', message: 'We have sent you an email.' },
    { name: 'Instructions2', message: 'Please go to your inbox to confirm your email address.' },
    { name: 'Instructions3', message: 'Your email address needs to be verified before getting started.' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .start('h1').add(this.Title).end()
          .start().addClass('container')
            .start().add(this.Instructions1).end()
            .start().add(this.Instructions2).end()
            .br()
            .start().add(this.Instructions3).end()
            .start(this.RESEND_EMAIL).end()
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'resendEmail',
      label: 'Resend Email',
      code: function(X) {
        var self = this;

      }
    }
  ]

});