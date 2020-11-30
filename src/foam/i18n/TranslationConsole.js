/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.i18n',
  name: 'TranslationConsole',
  extends: 'foam.u2.Controller',

  static: [
    function OPEN() {
      var w      = global.window.open("", 'Translation Console', "width=800,height=800,scrollbars=no", true);
      var window = foam.core.Window.create({window: w}, ctrl);
      var v      = this.create({}, window);
      v.write(window.document);

      foam.core.I18NString.GETTER__ = function(proto, prop, obj, key) {
        if ( obj.sourceCls_ ) {
          var source = obj.sourceCls_.id + '.' + obj.name + '.' + prop.name;
          var translation = v.translationService.getTranslation(v.locale, source, '');
          v.onTranslation(null, null, foam.locale, source, translation, obj.instance_[key]);
          console.log('**************************** ', source, obj.instance_[key]);
        }
        return obj.instance_[key];
      };

    }
  ],

  css: `
    * {
      font-family: Roboto, sans-serif;
      color: #555;
    }
    body {
      font-family: Roboto;
      background: rgb(238, 238, 238);
      overflow: none;
    }
    button { padding: 6px; }
    button span { color: white; }
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

  requires: [ 'foam.u2.borders.CardBorder' ],

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
        addClass(this.myClass()).
        start(this.CardBorder).
          style({height: '32px'}).
          start('span').
            style({'padding-top': '5px', display: 'inline-block', 'font-size': 'larger'}).            add('Translation Console').
          end().
          start('div').
            style({float: 'right'}).
            add('Search: ', this.SEARCH, '  Locale: ', this.LOCALE).
          end().
        end().
        start(this.CardBorder, {}, this.content$).
          style({'overflow-y':'scroll'}).
          style({'margin-top': '10px', height: '90%' }).
        end();
    }
  ],

  listeners: [
    function onTranslation(_, __, locale, source, txt, defaultText) {
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
