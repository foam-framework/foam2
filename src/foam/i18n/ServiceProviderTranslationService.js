/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.i18n',
  name: 'ServiceProviderProxyTranslationService',
  extends: [ 'foam.i18n.ProxyTranslationService' ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.Themes',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'getTranslation',
      javaCode: `
        String spid = (String) x.get("spid");
        if ( spid == null ) {
          Theme theme = (Theme) ((Themes) x.get("themes")).findTheme(x);
          if ( theme != null ) {
            spid = theme.getSpid();
          }
        }
        if ( spid == null ) {
          return getDelegate().getTranslation(x, locale, source, defaultText);
        }

        return getDelegate().getTranslation(
          x.put("localeDAO",
            ((DAO) x.get("localeDAO"))
            .where(
              OR(
               EQ(Locale.SPID, spid),
               EQ(Locale.SPID, "")
              )
            )
            .orderBy(Locale.SPID)),
          locale,
          source,
          defaultText
        );
      `
    }
  ]
});
