// documentation: handles login with SignUp.js and SignIn.js. And a property with img. Will use split border

foam.CLASS({
  package: 'foam.u2.view',
  name: 'LoginView',
  extends: 'foam.u2.View',

  documentation: `User View for SignUp or SignIn.

  DEPENDING ON MODEL PASSED IN:

  MESSAGEs possible for this view:
  TITLE: if exists will be ontop of model,
  FOOTER_TXT: if exists will be under model,
  FOOTER_LINK: if exists will be under FOOTER and the text associated to footerLink(),
  SUB_FOOTER_TXT: needed an additional option for the forgot password,
  SUB_FOOTER_LINK: needed an additional option for the forgot password,
  DISCLAIMER: if exists will be under img defined in imgPath. If imgPath empty, DISCLAIMER under SUB_FOOTER

  METHODs possible for this view:
  footerLink: code associated to footer msg and link,
  subfooterLink: code associated to subfooter msg

  DEPENDING ON PASSED IN ARGUMENTS:

  Property functionality:
  imgPath: if present view uses SplitScreenBorder **set where this view is called.

  `,

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
  ^ .login-logo-img {
    height: 19.4;
    margin-bottom: 12px;
    margin-top: 7vh;
  }
  
  ^button {
    margin-top: 56px;
    cursor: pointer;
    font-size: 16px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.5;
    letter-spacing: normal;
    color: #8e9090;
    display: inline;
    position: relative;
    top: 20px;
    left: 20px;
  }
  /* This is required for the visibility icon of the password field */
  ^ .input-image {
    position: absolute !important;
    width: 16px !important;
    height: 16px !important;
    bottom: 12px !important;
    right: 12px !important;
  }
  ^disclaimer {
    width: 35vw;
    font-family: Lato;
    font-size: 11px;
    color: #8e9090;
    margin-top: -12em;
    margin-left: 12vw;
    line-height: 1.5;
    background: transparent;
  }
  ^ .cover-img-block1 {
    position: sticky;
  }
  ^ .content-form {
    width: 32vw;
    margin-left: 3em;
}
  ^ .sme-image1 {
    width: 45vw;
    margin-top: -90vh;
    margin-left: 5em;
  }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'topBarShow_',
      factory: function() {
        if ( this.appConfig && this.appConfig.url ) {
          this.backLinkTxt_ = this.appConfig.url.includes('www.') ?
            this.appConfig.url.substring(this.appConfig.url.indexOf('www.') + 4) :
            this.appConfig.url;
          this.backLinkTxt_ = this.backLinkTxt_.includes('://') ?
            this.backLinkTxt_.substring(this.appConfig.url.indexOf('://') + 3) :
            this.backLinkTxt_;
          
          return true;
        }
        return false;
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
    'param',
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
      name: 'backLinkTxt_'
    }
  ],

  messages: [
    { name: 'GO_BACK', message: 'Go to ' },
    { name: 'MODE1', message: 'SignUp' }
  ],

  methods: [
    function init() {
      if ( ! this.param ) {
        this.param = {};
      }
      this.param.dao_ = ! this.param.dao_ ? this.loginVariables.dao_ : this.param.dao_;
      this.param.group_ = ! this.param.group_ ? this.loginVariables.group_ : this.param.group_;
      if ( this.mode_ === this.MODE1 ) this.model = foam.nanos.u2.navigation.SignUp.create(this.param, this);
      else this.model = foam.nanos.u2.navigation.SignIn.create(this.param, this);
    },
    function initE() {
      this.SUPER();

      // CREATE MODEL VIEW
      var right = this.Element.create({}, this)
        .start('img').addClass('login-logo-img').attr('src', this.theme.logo).end()
        .start().addClass('sme-title').add(this.TITLE).end()
        .startContext({ data: this })
          .addClass('content-form').tag(this.MODEL)
        .endContext()

        .start().addClass('sme-subTitle')
          .start('strong').add(this.model.FOOTER_TXT).end()
          .start('span').addClass('app-link')
            .add(this.model.FOOTER_LINK)
            .on('click', () => {
              this.model.footerLink();
            })
          .end()
        .end()
        .start().addClass('sme-subTitle')
          .start('strong').add(this.model.SUB_FOOTER_TXT).end()
          .start('span').addClass('app-link')
            .add(this.model.SUB_FOOTER_LINK)
            .on('click', () => {
              this.model.subfooterLink();
            })
          .end()
        .end();

      // CREATE SPLIT VIEW
      if ( !! this.imgPath ) {
        var split = foam.u2.borders.SplitScreenBorder.create();
        split.rightPanel.add(right);
      } else {
        right.start().add(this.model.DISCLAIMER).end();
      }

      // RENDER EVERYTHING
      this.addClass(this.myClass()).addClass('full-screen')
        .start().addClass('top-bar').show(this.topBarShow_)
          .start().addClass('top-bar-inner')
            .start().addClass(this.myClass('button'))
              .start()
                .addClass('horizontal-flip')
                .addClass('inline-block')
                .add('➔')
              .end()
              .add(this.GO_BACK).add(this.backLinkTxt_)
              .on('click', () => {
                window.location = this.appConfig.url;
              })
            .end()
          .end()
        .end()

        .callIfElse( !! this.imgPath && !! split, function() {
          this.add(split)
          .start()
            .addClass('cover-img-block1')
              .start('img')
                .addClass('sme-image1')
                .attr('src', this.imgPath)
              .end()
              .start('p')
                .addClass(this.myClass('disclaimer'))
                .add(this.model.DISCLAIMER)
              .end()
            .end();
        }, function() {
          this.add(right);
        });
    }
  ]
});
