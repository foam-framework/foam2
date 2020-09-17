/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// documentation: handles login with SignUp.js and SignIn.js. And a property with img. Will use split border

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'MDLoginView',
  extends: 'foam.u2.View',

  imports: [
    'appConfig',
    'loginVariables',
    'stack',
    'theme'
  ],

  requires: [
    'foam.u2.Element',
    'foam.u2.borders.SplitScreenBorder',
    'foam.nanos.u2.navigation.SignIn',
    'foam.nanos.u2.navigation.SignUp'
  ],

  css: `
  ^.foam-u2-ActionView {
    width: 100%;
  }

  /* ON RIGHT SIDE ALL **** */
  ^ .centerVertical {
    padding-top: 3vh;
    max-width: 30vw;
    margin: 0 auto;
  }

  /* SET ABOVE MODEL */
  ^ .topBar-logo-Back {
    height: 6vh;
    background: /*%LOGOBACKGROUNDCOLOUR%*/  #202341;
  }

  /* SET ON LOGO IMG */
  ^ .logoCenterVertical {
    margin: 0 auto;
    text-align: center;
    display: block;
  }
  ^ .top-bar-img {
    padding-left: 1vh;
    height: 4vh;
    padding-top: 1vh;
  }

  /* TITLE TXT ON MODEL */
  ^ .title-top {
    font-size: 2.5em;
    padding-bottom: 6rem;
    font-weight: bold;
  }

  /* ON MODEL */
  ^ .content-form {
    font-size: 2rem;
    padding-top: 20%;
    width: 70%;
    /* justify-content: center; */
    /* align-items: center; */
    height: 100%;
    margin: auto;
    text-align: center;
  }

  /* ON ALL FOOTER TEXT */
  ^ .bold-text-with-pad {
    font-weight: bold;
    margin-right: 0.2em;
  }
  ^ .center-footer {
    text-align: center;
  }

  /* TOP-TOP BAR NAV to go with backLink_ */
  ^ .top-bar-nav {
    background: /*%LOGOBACKGROUNDCOLOUR%*/ #202341;
    width: 100%;
    height: 4vh;
    border-bottom: solid 1px #e2e2e3
  }
  /* ON TXT IN TOP-TOP NAV */
  ^ .topBar-txt-link {
    cursor: pointer;
    font-size: 2.5vh;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    letter-spacing: normal;
    color: #8e9090;
    margin-left: 2vw;
    margin-top: 1vw;
  }

  /* DISCLAIMER */
      /* ON NO IMG SPLIT & IMG SPLIT */
  ^ .disclaimer-login {
    width: 35vw;
    font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 0.75em;
    color: #8e9090;
    margin-left: 12vw;
    line-height: 1.5;
    background: transparent;
  }
      /* ON IMG SPLIT */
  ^ .disclaimer-login-img {
    margin-top: -20vh;
  }

/* ON LEFT SIDE IMG */
  ^ .cover-img-block1 {
    position: sticky;
  }
  ^ .image-one {
    width: 38vw;
    margin-top: -90vh;
    margin-left: 10vw;
  }
  ^ .foam-u2-ActionView-login {
      margin: auto;
      padding: 1.5rem;
      font-size: 2.5rem;
  }

  ^ .foam-u2-detail-SectionedDetailPropertyView m3 {
    font-size: 2rem;
  }

  ^ .foam-u2-detail-SectionedDetailPropertyView input {
      height: 4rem;
      font-size: 2rem;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'topBarShow_',
      factory: function() {
        return !! this.backLink_;
      },
      hidden: true
    },
    {
      name: 'model',
      factory: () => {
       return {};
      },
      view: { class: 'foam.u2.detail.VerticalDetailView' }
    },
    {
      name: 'param',
      factory: function() {
        return {};
      }
    },
    {
      class: 'String',
      name: 'mode_',
      hidden: true
    },
    {
      class: 'String',
      name: 'imgPath',
      expression: function(loginVariables) {
        return loginVariables.imgPath || '';
      }
    },
    {
      class: 'String',
      name: 'backLinkTxt_',
      factory: function() {
        let temp = this.backLink_.includes('www.') ?
          this.backLink_.substring(this.backLink_.indexOf('www.') + 4) :
          this.backLink_;
        return temp.includes('://') ?
          temp.substring(temp.indexOf('://') + 3) :
          temp;
      }
    },
    {
      class: 'String',
      name: 'backLink_',
      factory: function() {
        return this.model.backLink_ || this.appConfig.externalUrl || undefined;
      },
      hidden: true
    }
  ],

  messages: [
    { name: 'GO_BACK', message: 'Go to ' },
    { name: 'MODE1', message: 'SignUp' }
  ],

  methods: [
    function init() {
      // Use passed in values or default loginVariables defined on ApplicationControllers
      this.param.dao_ = !! this.param.dao_ ? this.param.dao_ : this.loginVariables.dao_;
      this.param.group_ = !! this.param.group_ ? this.param.group_ : this.loginVariables.group_;
      this.param.countryChoices_ = !! this.param.countryChoices_ ? this.param.countryChoices_ : this.loginVariables.countryChoices_;
      // Instantiating model based on mode_
      if ( this.mode_ === this.MODE1 ) {
        this.model = this.SignUp.create(this.param, this);
      } else {
        this.model = this.SignIn.create(this.param, this);
      }
    },

    function initE() {
      this.SUPER();
      this.document.addEventListener('keyup', this.onKeyPressed);
      this.onDetach(() => {
        this.document.removeEventListener('keyup', this.onKeyPressed);
      });
      this.addClass(this.myClass());
//      let logo = this.theme.largeLogo ? this.theme.largeLogo : this.theme.logo;
      // CREATE MODEL VIEW
      this.start('div').addClass('login-container')
      // Title txt and Model
        .start().addClass('title-top').add(this.model.TITLE).end()
        .startContext({ data: this })
          .addClass('content-form').tag(this.MODEL).br()
        .endContext()
      // first footer
      .br()
      .start().addClass('center-footer')
          .start('span').addClass('bold-text-with-pad').add(this.model.FOOTER_TXT).end()
          .start('span').addClass('link')
            .add(this.model.FOOTER_LINK)
            .on('click', () => {
              this.model.footerLink(this.topBarShow_, this.param);
            })
          .end()
      // second footer
        .br().br()
          .start('span').addClass('bold-text-with-pad').add(this.model.SUB_FOOTER_TXT).end()
          .start('span').addClass('link')
            .add(this.model.SUB_FOOTER_LINK)
            .on('click', () => {
              this.model.subfooterLink();
            })
          .end()
        .end()
        .end();


//      this.addClass('centerVertical').start().addClass('disclaimer-login').add(this.model.DISCLAIMER).end();
    }
  ],

  listeners: [
    function onKeyPressed(e) {
      e.preventDefault();
      var key = e.key || e.keyCode;
      if ( key === 'Enter' || key === 13 ) {
          this.model.login();
      }
    }
  ]
});
