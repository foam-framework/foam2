/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'LanguageChoiceView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.u2.View',
    'foam.nanos.auth.Language',
  ],

  imports: [
    'stack',
    'languageDAO',
    'subject',
    'userDAO',
    'countryDAO',
    'translationService'
  ],

  exports: [ 'as data' ],

  css: `
    ^container {
      height: 100%;
      display: flex;
      align-items: center;
    }
    ^container:hover {
      cursor: pointer;
    }
    ^container span {
      font-size: 12px;
    }
    ^carrot {
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 5px solid white;
      display: inline-block;
      float: right;
      margin-left: 7px;
    }
    ^ .foam-u2-ActionView-languageChoice {
      background: none !important;
      border: 0 !important;
      box-shadow: none !important;
      width: max-content;
      cursor: pointer;
      margin-right: 27px;
    }
    ^ .foam-nanos-u2-navigation-TopNavigation-LanguageChoiceView {
      align-items: center;
    }
    ^ .foam-u2-ActionView-languageChoice > span {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 15px;
      font-weight: 300;
      letter-spacing: 0.2px;
      color: #ffffff;
    }
    ^ .popUpDropDown > div {
      height: 40px;
      padding: 8px 24px;
      padding-right: 48px;
      font-size: 14px;
      font-weight: 300;
      color: /*%BLACK%*/ #1e1f21;
      line-height: 25px;
      box-sizing: border-box;
      cursor: pointer;
      background: white;
      color: black;
      border-left: solid 1px /*%GREY5%*/ #f5f7fa;
      border-right: solid 1px /*%GREY5%*/ #f5f7fa;
    }
    ^ .popUpDropDown {
      z-index: 950;
      box-shadow: none;
      position: absolute;
      top: 60px;
      font-weight: 300;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      width: 160px;
    }
    ^ .popUpDropDown > div:hover{
      background: /*%PRIMARY5%*/ #e5f1fc !important;
      border-left: solid 1px /*%PRIMARY5%*/ #e5f1fc;
      border-right: solid 1px /*%PRIMARY5%*/ #e5f1fc;
    }
    ^background {
      bottom: 0;
      left: 0;
      opacity: 0.4;
      right: 0;
      top: 0;
      position: fixed;
      z-index: 850;
    }
  `,

  properties: [
    'optionsBtn_',
    'supportedLanguages',
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Language',
      name: 'lastLanguage',
      factory: function() {
        let language = this.supportedLanguages.find( e => e.toString() === foam.locale )
        language = language === undefined ? this.defaultLanguage : language
        localStorage.setItem('localeLanguage', language.toString());
        return language
      }
    }
  ],

  methods: [
    async function initE() {
      this.supportedLanguages = (await this.languageDAO
        .where(foam.mlang.predicate.Eq.create({
          arg1: foam.nanos.auth.Language.ENABLED,
          arg2: true
        })).select()).array;

      let country = await this.countryDAO.find(this.lastLanguage.variant)
      let label = this.lastLanguage.variant != "" ? `${this.lastLanguage.nativeName}(${this.lastLanguage.variant})` : `${this.lastLanguage.nativeName}`
      if ( country && country.nativeName != null ) {
        label = `${this.lastLanguage.nativeName}\u00A0(${country.nativeName})`
      }

      this
        .addClass(this.myClass())
        .tag('span', null, this.optionsBtn_$)
        .start(this.LANGUAGE_CHOICE, {
          label: label
        })
        .start('div')
          .addClass(this.myClass('carrot'))
        .end()
      .end();
    },

    async function formatLabel(language) {
      let country = await this.countryDAO.find(language.variant)
      let label = language.variant != "" ? `${language.nativeName}(${language.variant})` : `${language.nativeName}`
      if ( country && country.nativeName != null ) {
        label = `${language.nativeName}\u00A0(${country.nativeName})`
      }
      return label
    }
  ],

  actions: [
    {
      name: 'languageChoice',
      label: '',
      code: function() {
        var self = this;
        self.optionPopup_ = this.View.create({});

        self.optionPopup_ = self.optionPopup_
          .start('div').addClass('popUpDropDown')
            .add(
              this.supportedLanguages.map( c => {
                return self.E()
                  .start('div')
                    .add(self.formatLabel(c))
                    .on('click', async function() {
                      let user = self.subject.realUser
                      user.language = c.id
                      await self.userDAO.put(user)

                      location.reload();

                      // TODO: Figure out a better way to store user preferences
                      localStorage.setItem('localeLanguage', c.toString());
                    });
              }))
          .end()
          .start()
            .addClass(this.myClass('background'))
            .on('click', () => {
              self.optionPopup_.remove();
            })
          .end();

        self.optionsBtn_.add(self.optionPopup_);
      }
    }
  ]
});
