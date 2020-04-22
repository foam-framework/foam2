/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ChangePasswordView',
  extends: 'foam.u2.Controller',

  documentation: 'renders a password change model',

  imports: [
    'stack',
    'theme',
    'user'
  ],

  requires: [
    'foam.u2.detail.SectionView',
    'foam.nanos.auth.SendPassword',
    'foam.nanos.auth.UpdatePassword',
    'foam.nanos.auth.ResetPassword'
  ],

  css: `
    ^ {
      background: #ffffff;
      height: 100vh;
    }
    ^top-bar {
      background: /*%LOGOBACKGROUNDCOLOUR%*/ #202341;
      width: 100%;
      height: 8vh;
      border-bottom: solid 1px #e2e2e3;
    }
    ^top-bar img {
      height: 4vh;
      padding-top: 2vh;
      display: block;
      margin: 0 auto;
    }
    ^content {
      max-width: 30vw;
      margin: 4vh auto 0 auto;
    }
    ^section {
    }
    /* title  */
    ^ ^section h2 {
      margin-top: 0;
      margin-bottom: 4vh;
      font-size: 2.5rem;
    }
    /* subtitle */
    ^ ^section .subtitle {
      color: /*%GREY2%*/ #8e9090;
      font-size: 1rem;
      margin-top: 0;
      margin-bottom: 3vh;
      line-height: 1.5;
      text-align: center;
    }
    ^link {
      color: /*%PRIMARY3%*/ #604aff;
      cursor: pointer;
      text-align: center;
      padding-top: 1.5vh;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'showHeader',
      documentation: `This property toggles the view from having a top bar displayed.`,
      hidden: true,
      factory: function() {
        // implement a logic to hide logo in certain places
        return true;
      }
    },
    {
      class: 'Boolean',
      name: 'isHorizontal',
      documentation: 'setting this to true makes input fields in passwordModel to be displayed horizontally',
      factory: function() {
        return this.mode === 'update';
      }
    },
    {
      class: 'String',
      name: 'mode',
      documentation: 'name of password model used for this view',
      factory: function() {
        if ( window.location.hash.includes('personal-settings') ||
             window.location.hash.includes('set-personal') ) {
          return 'update';
        }
        const token = new URLSearchParams(location.search).get('token');
        if ( token ) {
          return 'reset';
        }
        return 'send';
      }
    },
    {
      name: 'passwordModel',
      documentation: 'password model used for this view',
      factory: function() {
        if ( this.mode === 'update' ) {
          return this.UpdatePassword.create();
        } else if ( this.mode === 'reset' ) {
          return this.ResetPassword.create();
        } else {
          return this.SendPassword.create();
        }
      }
    }
  ],

  methods: [
    {
      name: 'resizeInputFields',
      code: function(isHorizontal) {
        // evaluation of this gridColumns on a property does not handle an evaluation, only an int, thus function here managing this.
        if ( isHorizontal ) {
          if ( this.mode === 'update' ) {
            this.UpdatePassword.getAxiomByName('originalPassword').gridColumns = 4;
            this.UpdatePassword.getAxiomByName('newPassword').gridColumns = 4;
            this.UpdatePassword.getAxiomByName('confirmationPassword').gridColumns = 4;
          } else if ( this.mode === 'reset' ) {
            this.ResetPassword.getAxiomByName('newPassword').gridColumns = 6;
            this.ResetPassword.getAxiomByName('confirmationPassword').gridColumns = 6;
          }
        }
      }
    },

    function init() {
      this.resizeInputFields(this.isHorizontal);
    },

    function initE() {
      const self = this;
      const logo = this.theme.largeLogo || this.theme.logo;

      this.addClass(this.myClass())
        // header
        .callIf(this.showHeader, function() {
          this.start().addClass(self.myClass('top-bar'))
            .start('img').attr('src', logo).end()
          .end();
        })
        // body
        .start().addClass(this.myClass('content'))
          // section
          .start().addClass(this.myClass('section'))
            .start(this.SectionView, {
              data: this.passwordModel,
              sectionName: this.passwordModel.cls_.model_.sections[0].name,
              isCentered: true
            }).end()
          .end()
          // link
          .callIf(this.mode === 'send', function() {
            this.start().addClass(self.myClass('link'))
              .add(self.SendPassword.REDIRECTION_TO)
              .on('click', function() {
                self.stack.push({ class: 'foam.u2.view.LoginView', mode_: 'SignIn' }, self);
              })
            .end();
          })
        .end();
    }
  ]
});
