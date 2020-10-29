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
        if ( locale.equals("en") ) return originalText;

        DAO localeDAO = (DAO) x.get("localeDAO");

        List<Locale> translationInArray = (ArrayList<Locale>) ((ArraySink) localeDAO.where(
          AND(
            EQ(Locale.SOURCE, source),
            OR(
              EQ(Locale.LOCALE, locale),
              EQ(Locale.VARIANT, locale),
              EQ(Locale.LOCALE_VARIANT, locale)
            )
          )
        ).limit(1).select(new ArraySink())).getArray();
        
        String translation = translationInArray.size() > 0 ? translationInArray.get(0).getTarget() : originalText;

        return translation;
      `
    }
  ]
});
