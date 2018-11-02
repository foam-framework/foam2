/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.u2.view',
  name: 'NewPasswordView',
  extends: 'foam.u2.view.PasswordView',
  requires: [
    'foam.PasswordStrengthGauge'
  ],
  css: `


    ^ .outer{
      width: 60%;
      height: 4px;
      border-radius: 2px;
      margin-left: 5%;
      margin-bottom: 1%;
      margin-top: 2%;
      border-radius: 2px;
      background-color: #b9b9b9;
      display: inline-block;
    }

    ^ .sme-inputContainer{
      margin-bottom: 2%;

    }

    ^ .strength {
      border-radius: 2px;
      height: 4px;      
    }

    ^ .message {
      -webkit-text-security: none;
      display: inline;
      width: 75px;
      height: 12px;
      font-family: Avenir;
      font-size: 10px;
      font-weight: 900;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.2;
      letter-spacing: normal;

      margin-left: 6%;
    }


    ^ ._0 {
      width: 0%;
    }

    ^ ._1 {
      width: 25%;
      background-color: #f31d1d
    }
    
    ^ ._2 {
      width: 50%;
      background-color: #f38d2f
    }
    ^ ._3 {
      width: 80%;
      background-color: #ece356
    }
    ^ ._4 {
      width: 100%;
      background-color: #36a52b      
    }
    ^ ._0 {
      color: #000000
    }

    ^ .text1 {
      color: #f31d1d
    }
    
    ^ .text2 {
      color: #f38d2f
    }
    ^ .text3 {
      color: #ece356
    }
    ^ .text4 {
      color: #36a52b      
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'strength',
      value: '_0'
    },
    {
      class: 'String',
      name: 'textStrength',
      value: '_0'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass())
      .start().
        start('div').addClass('outer').
          start('div').addClass('strength').addClass(this.strength$).end().
        end().
        start('div').addClass('message').addClass(this.textStrength$).
        
        add(this.textStrength$.map(function(textStrength) {
          switch ( textStrength ) {
            case ('text0)'):
              return 'That\'s really weak';
            case ('text1'):
              return 'That\'s still a pretty weak password';
            case ('text2'):
              return 'Not bad, but try adding some more complexity';
            case ('text3'):
              return 'You\'re almost there!';
            case ('text4'):
              return 'That\'s an awesome password!';
            default:
              return 'Password strength';
          }
        })).
        end().
      end();
    }
  ],

  listeners: [
    function measureEntropy(evt) {
      var password = document.getElementsByClassName('full-width-input-password')[0].value;
      if ( password ) {
        score = zxcvbn(password)['score'];
        this.strength = '_' + score;
        this.textStrength = 'text' + score;
      };
    }
  ]
});
