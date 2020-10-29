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
        DAO localeDAO = (DAO) x.get("localeDAO");

        Locale localeEntry = (Locale) localeDAO.find(AND(
          EQ(Locale.SOURCE, source),
          EQ(Locale.LOCALE, locale)
        ));

        if ( localeEntry == null ) {
          localeEntry = (Locale) localeDAO.find(AND(
            EQ(Locale.SOURCE, source),
            EQ(Locale.VARIANT, locale)
          ));
        }

        String translation = localeEntry != null ? localeEntry.getTarget() : defaultText;
        
        return translation;
      `
    }
  ]
});
