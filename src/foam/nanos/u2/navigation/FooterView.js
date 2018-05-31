foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'FooterView',
  extends: 'foam.u2.View',

  documentation: 'View to display footer, including copyright label',
  
  requires: [
    'foam.u2.PopupView',
    'foam.u2.dialog.Popup',
  ],

  imports: [
    'appConfig',
    'termsUrl',
    'user'
  ],

  exports: [
    'openTermsModal'
  ],

  css: `
    ^ {
      width: 100%;
      min-width: 992px;
      margin: auto;
      position: relative;
      overflow: hidden;
      zoom: 1;
    }
    ^ div {
      font-size:14px;
    }
    ^ .mode {
      display: inline-block;
    }
    ^ .copyright-label {
      margin-right: 50px;
      float: right;
    }
    ^ .col {
      display: inline-block;
      vertical-align: middle;
    }
    ^ .copyright-label,
    ^ .net-nanopay-ui-ActionView-goToTerm,
    ^ .net-nanopay-ui-ActionView-goToPrivacy,
    ^ .net-nanopay-ui-ActionView-goTo, 
    ^ .mode {
      background: transparent;
      opacity: 0.6;
      font-family: Roboto;
      font-size: 14px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: 0.2px;
      color: #272727;
      width: auto !important;
      padding: 0 10px !important;
    }
    ^ .net-nanopay-ui-ActionView-goToTerm:hover,
    ^ .net-nanopay-ui-ActionView-goToPrivacy:hover,
    ^ .net-nanopay-ui-ActionView-goTo:hover {
      text-decoration: underline;
    }
    ^ .net-nanopay-ui-ActionView-goTo {
      margin-left: 50px;
    }
    ^ .copyright-label{
      flaot: right;
    }
    ^ .mini-links {
      float: left;
    }
  `,

  methods: [
    function initE(){
      this.SUPER();

      this
        .addClass(this.myClass())
        .start('div').addClass('col').addClass('mini-links')
          .start(this.GO_TO,{ label$: this.appConfig.urlLabel$ }).end()
          .add('|')
          .start(this.GO_TO_TERM, { label$: this.appConfig.termsAndCondLabel$ }).end()
          .add('|')
          .start(this.GO_TO_PRIVACY, { label$: this.appConfig.privacy$ }).end()
          .add('|')
          .start().addClass('mode').add(this.appConfig.mode$.map(function(m) { return m.label; }), ' version: ', this.appConfig.version$).end()
        .end()
        .start('div').addClass('col').addClass('copyright-label')
          .start('p').add(this.appConfig.copyright$).end()
        .end()

        

    },
    function openTermsModal() {
      this.add(this.Popup.create().tag({ class: this.appConfig.termsAndCondLink, exportData$: this.appConfig.version$ }));
    }
  ],

  actions: [
     {
      name: 'goTo',
      label:'',
      code: function(X) {
        this.window.location.assign(X.appConfig.url);
      }
    },
    {
      name: 'goToTerm',
      label: '',
      code: function(X) {
        X.openTermsModal()
      }
    },
    {
      name: 'goToPrivacy',
      label: '',
      code: function(X) {
        this.window.location.assign(X.appConfig.privacyUrl);
      }
    }
  ]
});
