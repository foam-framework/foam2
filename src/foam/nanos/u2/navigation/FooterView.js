/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
      width: 85%;
      min-width: 992px;
      margin: auto;
      position: relative;
      overflow: hidden;
      zoom: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
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
    ^ .foam-u2-ActionView-goToTerm,
    ^ .foam-u2-ActionView-goToPrivacy,
    ^ .foam-u2-ActionView-goTo,
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
    ^ .foam-u2-ActionView-goToTerm:hover,
    ^ .foam-u2-ActionView-goToPrivacy:hover,
    ^ .foam-u2-ActionView-goTo:hover {
      text-decoration: underline;
    }
    ^ .foam-u2-ActionView-goTo {
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
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start('div').addClass('col').addClass('mini-links')
          .tag(this.GO_TO, {
            label$: this.appConfig.urlLabel$,
            buttonStyle: 'UNSTYLED'
          })
          .add('|')
          .tag(this.GO_TO_TERM, {
            label$: this.appConfig.termsAndCondLabel$,
            buttonStyle: 'UNSTYLED'
          })
          .add('|')
          .tag(this.GO_TO_PRIVACY, {
            label$: this.appConfig.privacy$,
            buttonStyle: 'UNSTYLED'
          })
          .add('|')
          .start().addClass('mode').add(this.appConfig.mode$.map(function(m) { return m.label; }), ' version: ', this.appConfig.version$).end()
        .end()
        .start('div').addClass('col').addClass('copyright-label')
          .start('p').add(this.appConfig.copyright$.map(function(str) {
            str = str.replace(/@\{(\w+)\}/g, function() {
              var date = new Date();
              return date.getFullYear();
            });
            return str;
          })).end()
        .end();
    },
    function openTermsModal() {
      this.add(this.Popup.create().tag({ class: this.appConfig.termsAndCondLink, exportData$: this.appConfig.version$ }));
    }
  ],

  actions: [
     {
      name: 'goTo',
      label: '',
      code: function(X) {
        this.window.location.assign(X.appConfig.url);
      }
    },
    {
      name: 'goToTerm',
      label: '',
      code: function(X) {
        X.window.location.assign(X.appConfig.termsAndCondLink);
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
