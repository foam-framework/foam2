/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.i18n',
  name: 'TranslationView',
  extends: 'foam.u2.Controller',

  static: [
    function OPEN() {
      var w      = global.window.open("", 'Translation Console', "width=800,height=800,scrollbars=no", true);
      var window = foam.core.Window.create({window: w}, ctrl);
      var v      = foam.i18n.TranslationView.create({}, window);
      v.write(window.document);
    }
  ],

  css: `
    .foam-u2-ActionView-medium { height: 34px !important; background: pink; }
  `,

  classes: [
    {
      name: 'RowView',
      extends: 'foam.u2.Controller',

      constants: [
        { name: 'MAX_ROWS', value: 1000 }
      ],

      imports: [ 'locale', 'localeDAO', 'rows', 'search', 'translationService' ],

      requires: [ 'foam.i18n.Locale' ],

      properties: [
        {
          class: 'String',
          name: 'source',
          displayWidth: 50
        },
        {
          class: 'String',
          name: 'text',
          displayWidth: 50
        },
        {
          class: 'String',
          name: 'defaultText',
          displayWidth: 50
        },
      ],

      methods: [
        function initE() {
          this.SUPER();
          var row  = this.rows;
          var self = this;

          this.onDetach(this.rows$.sub(() => { if ( this.rows > row + this.MAX_ROWS ) this.remove(); }));

          this.
            show(this.search$.map(
              function(s) {
                var str = ( self.source + ' ' + self.text + ' ' + self.defaultText ).toLowerCase();
                return str.indexOf(s.toLowerCase()) != -1;
              }
            )).
            add('Source: ', this.SOURCE, ' Translation: ', this.TEXT, ' ', this.DEFAULT_TEXT, ' ', this.UPDATE).
            br();
        }
      ],
      actions: [
        function update() {
          var l = this.Locale.create({
            locale:  this.locale.substring(0, 2),
            variant: this.locale.substring(3),
            source:  this.source,
            target:  this.text
          });

          this.localeDAO.put(l);

          this.translationService.localeEntries[this.source] = this.text;
        }
      ]
    }
  ],

  imports: [
    'translationService'
  ],

  exports: [ 'locale', 'rows', 'search' ],

  properties: [
    {
      class: 'Int',
      name: 'rows'
    },
    {
      class: 'String',
      name: 'search',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        onKey: true
      }
    },
    {
      class: 'String',
      name: 'locale',
      factory: function() { return foam.locale; }
//          view: 'net.nanopay.ui.topNavigation.LanguageChoiceView'
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.translationService.translation.sub(this.onTranslation);
    },

    function initE() {
      this.
        start('div').add('Translation Console').end().
        add('Search: ', this.SEARCH, ' Locale: ', this.LOCALE).
        br().tag('hr').start('div', {}, this.content$).style({'overflowY':'scroll'}).end();
    }
  ],

  listeners: [
    function onTranslation(src, _, locale, source, txt, defaultText) {
      this.add(this.RowView.create({
        locale:      locale,
        source:      source,
        text:        txt,
        defaultText: defaultText
      }));
      this.rows++;
    }
  ]
});
