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
    'foam.u2.PopupView',
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
  ^carrot {
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid white;
    display: inline-block;
    float: right;
    margin-top: 7px;
    margin-left: 7px;
  }
  ^ .foam-u2-ActionView-languageChoice {
    display: inline-block;
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
    font-size: 16px;
    font-weight: 300;
    letter-spacing: 0.2px;
    color: #ffffff;
  }
  ^ .popUpDropDown > div {
    margin-left: -16px;
    margin-right: -16px;
    width: 100%;
    height: 25;
    padding: 0px 16px 5px 16px;
    font-size: 14px;
    font-weight: 300;
    letter-spacing: 0.2px;
    color: /*%BLACK%*/ #1e1f21;
    line-height: 30px;
  }
  ^ .foam-u2-PopupView {
    border-radius: 4px;
    left: -30 !important;
    top: 51px !important;
    padding: 0px 16px 0px 16px !important;
    z-index: 1000;
    width: fit-content !important;
    background: white;
    opacity: 1;
    box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
  }
  ^ .popUpDropDown > div:hover{
    background-color: #1cc2b7;
    color: white;
    cursor: pointer;
  }
  ^ .popUpDropDown::before {
    content: ' ';
    position: absolute;
    height: 0;
    width: 0;
    border: 8px solid transparent;
    border-bottom-color: white;
    -ms-transform: translate(110px, -16px);
    transform: translate(50px, -16px);
  }
  ^ .flag {
    width: 30px !important;
    height: 17.6px;
    object-fit: contain;
    padding-top: 6px;
    padding-left: 10px;
    margin-right: 23px;
  }
  ^ img {
    height: 17.6px !important;
    margin-right: 6;
    width: auto;
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
        self.optionPopup_ = this.PopupView.create({
          width: 1165,
          x: -1137,
          y: 140
        }).on('click', function() {
          return self.optionPopup_.remove();
        });

        self.optionPopup_ = self.optionPopup_.start('div').addClass('popUpDropDown')
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
          .end();
        self.optionsBtn_.add(self.optionPopup_);
      }
    }
  ]
});
