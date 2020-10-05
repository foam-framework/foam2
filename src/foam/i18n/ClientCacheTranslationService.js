/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.i18n',
  name: 'ClientCacheTranslationService',

  implements: [
    'foam.i18n.TranslationService',
    'foam.mlang.Expressions'
  ],

  imports: [
    'localeDAO'
  ],

  requires: [
    'foam.core.Latch',
    'foam.dao.MDAO',
    'foam.i18n.Locale'
  ],

  properties: [
    {
      name: 'initLatch',
      documentation: 'Latch to denote cache has been loaded and service is ready',
      factory: function() { return this.Latch.create(); }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'localeCache',
      factory: function() {
        return this.MDAO.create({of: this.Locale}).addPropertyIndex(this.Locale.SOURCE);
      },
    },
    {
      name: 'locale',
      factory: function() {
        return (foam.language || "en").substring(0,2);
      }
    },
    {
      name: 'variant',
      factory: function() {
        return (foam.language || "").substring(3);
      }
    }
  ],

  methods: [
    function init() {

      // TODO: this should be moved to the server's getTranslations() method
      this.loadLanguageLocales().then(() => {
        if ( this.hasVariant() ) {
          this.loadVariantLocales().then(this.initLatch);
        } else {
          this.initLatch.resolve();
        }
      });
    },

    function loadLanguageLocales() {
      console.log('************************ loading language locales');
      return this.localeDAO.where(
        this.AND(
          this.EQ(this.Locale.LOCALE,  this.locale),
          this.EQ(this.Locale.VARIANT, ''))).select(this.localeCache);
    },

    function loadVariantLocales() {
      console.log('************************ loading variant locales');
      return this.localeDAO.where(
        this.AND(
          this.EQ(this.Locale.LOCALE,  this.locale),
          this.EQ(this.Locale.VARIANT, this.variant))).select(
            l => this.localeCache.put(this.Locale.create({
              id: l.id, locale: l.locale, source: l.source, target: l.target
            })));
    },

    function hasVariant() { return !! this.variant; },

    /*
    {
      name: 'getTranslations',
      args: [ 'String locale' ],
      async: true
    },
    */
    {
      name: 'getTranslation',
      async: true,
      args: [ 'String locale', 'String source' ],
      type: 'String',
      code: function(locale, source) {
        console.log('************************ getTranslation', source);
        return this.initLatch.then(() => {
          this.localeCache.find(this.EQ(this.Locale.SOURCE, source)).then(l => {
            console.log('    -> ', l && l.target);
            return l && l.target;
          });
        });
      }
    }
  ]
});
