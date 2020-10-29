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

        boolean hasVariant = locale.contains("-");
        String language = hasVariant ? locale.substring(0,2).toLowerCase() : locale.toLowerCase();
        String variant = hasVariant ? locale.substring(3).toUpperCase() : "";

        Locale localeEntry = (Locale) localeDAO.find(
          AND(
            EQ(Locale.SOURCE, source),
            OR(
              AND(
                EQ(Locale.LOCALE, language),
                EQ(Locale.VARIANT, variant)
              ),
              EQ(Locale.LOCALE_VARIANT, locale)
            )
          )
        );

        if ( localeEntry == null ) {
          localeEntry = (Locale) localeDAO.find(AND(
            EQ(Locale.SOURCE, source),
            EQ(Locale.LOCALE, language)
          ));
        }

        String translation = localeEntry != null ? localeEntry.getTarget() : defaultText;
        
        return translation;
      `
    }
  ]
});
