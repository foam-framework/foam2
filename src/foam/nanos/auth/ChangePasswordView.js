/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
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

  css: `
    ^ {
      margin-bottom: 24px
    }
    ^top-bar {
      background: /*%LOGOBACKGROUNDCOLOUR%*/ #202341;
      width: 100%;
      height: 12vh;
      border-bottom: solid 1px #e2e2e3;
    }
    ^top-bar img {
      height: 8vh;
      padding-top: 2vh;
      display: block;
      margin: 0 auto;
    }
    ^content {
      padding-top: 4vh;
      margin: 0 auto;
    }
    ^content-horizontal {
      width: 90%;
    }
    ^content-vertical {
      width: 30vw;
    }
    ^section {
      margin-bottom: 10%;
    }
    /* title  */
    ^ ^section h2 {
      margin-top: 0;
      margin-bottom: 4vh;
      font-size: 2.5rem;
      text-align: center;
    }
    /* subtitle */
    /* using nested CSS selector to give a higher sepcificy and prevent being overriden  */
    ^ ^section .subtitle {
      color: /*%GREY2%*/ #8e9090;
      font-size: 1rem;
      margin-top: 0;
      margin-bottom: 3vh;
      line-height: 1.5;
      text-align: center;
    }
    /* button */
    ^ ^section .foam-u2-layout-Cols {
      justify-content: center !important; /* centers button */
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
      value: true,
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'isHorizontal',
      documentation: `Toggles the view from displaying input fields horizontally or vertically.
        Not recommended to set this to true if there are less than three input fields for password model.
      `,
      value: false,
      hidden: true
    },
    {
      class: 'String',
      name: 'modelOf',
      documentation: `Password model used for this view.
        Pass this property along when you create this view.
        e.g., stack.push({
          class: 'foam.nanos.auth.ChangePasswordView',
          modelOf: 'foam.nanos.auth.RetrievePassword'
        })
      `
    },
    {
      class: 'FObjectProperty',
      of: this.modelOf,
      name: 'model',
      documentation: 'instance of password model used for this view',
      factory: function() {
        return foam.lookup(this.modelOf)
          .create({ isHorizontal: this.isHorizontal }, this);
      },
      view: { class: 'foam.u2.detail.VerticalDetailView' }
    }
  ],

  methods: [
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
        .start()
          .addClass(this.myClass('content'))
          .callIfElse(this.isHorizontal, function() {
            this.addClass(self.myClass('content-horizontal'));
          }, function() {
            this.addClass(self.myClass('content-vertical'));
          })
          // section
          .start().addClass(this.myClass('section'))
            .start(this.MODEL).end()
          .end()
          // link
          .callIf(this.model.hasBackLink, function() {
            this.start().addClass(self.myClass('link'))
              .add(self.model.REDIRECTION_TO)
              .on('click', function() {
                self.stack.push({ class: 'foam.u2.view.LoginView', mode_: 'SignIn' }, self);
              })
            .end();
          })
        .end();
    }
  ]
});
