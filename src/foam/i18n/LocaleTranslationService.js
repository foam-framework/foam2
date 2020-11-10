/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.i18n',
  name: 'LocaleTranslationService',
  implements: [ 'foam.i18n.TranslationService' ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.i18n.Locale',
    'java.util.List',
    'java.util.ArrayList',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'getTranslations',
      javaCode: `
        System.err.println("*********************************** getTranslations");
        return null;
      `
    },
    {
      name: 'getTranslation',
      javaCode: `
        if ( locale == "" || source == "" ) return defaultText;

        DAO localeDAO = (DAO) getX().get("localeDAO");

        // locale - determines locale type (en, fr, es …etc)        
        // variant - Locale variation (CA for en-CA, CA for fr-CA, AT for de_AT …etc)
        String variant = "";
        Locale localeEntry = null;

        // note: 'locale' passed to the function may be in locale format or in local variant format
        // so we need to check which format is used and parse it if necessary.
        boolean hasVariant = locale.contains("-");
        if ( hasVariant ) {
          variant = locale.substring(3).toUpperCase();
          locale = locale.substring(0,2).toLowerCase();

          // search for locale and variant
          localeEntry = (Locale) localeDAO.find(
            AND(
              EQ(Locale.SOURCE, source),        
              EQ(Locale.LOCALE, locale),
              EQ(Locale.VARIANT, variant)
            )
          );
        } else {
          locale = locale.toLowerCase();
        }

        // search for locale with no variant
        if ( localeEntry == null ) {
          localeEntry = (Locale) localeDAO.find(
            AND(
              EQ(Locale.SOURCE, source),
              EQ(Locale.LOCALE, locale),
              EQ(Locale.VARIANT, "")
            )
          );
        }

        String translation = localeEntry != null ? localeEntry.getTarget() : defaultText;
        
        return translation;
      `
    }
  ]
});
