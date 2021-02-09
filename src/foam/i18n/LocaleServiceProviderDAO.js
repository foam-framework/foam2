/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.i18n',
  name: 'LocaleServiceProviderDAO',
  extends: [ 'foam.dao.ProxyDAO' ],

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.Themes',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        String spid = getSpid(x);
        if ( spid == null ) {
          return getDelegate().find_(x, id);
        }
        return getDelegate().find_(
          x.put("localeDAO", getLocaleDAO(x, spid)),
          id);
      `
    },
    {
      documentation: 'For multiple matches, entry with spid trumps without.',
      name: 'select_',
      javaCode: `
        String spid = getSpid(x);
        if ( spid == null ) {
          return getDelegate().select_(x, sink, skip, limit, order, predicate);
        }

// TODO: warn if argument sink is not null. The LcoaleServiceProviderSink is not a ProxySink, soo it replaces the argument sink.

        Sink localeSink = new LocaleServiceProviderSink(x);
        getDelegate().select_(
          x.put("localeDAO", getLocaleDAO(x, spid)),
          localeSink,
          skip,
          limit,
          order,
          predicate);
        return localeSink;
      `
    },
    {
      documentation: 'If argument Locale, without spid, matches Locale with spid, then update Locale with spid. Client only receives Locales with spid if there are both. ',
      name: 'put_',
      javaCode: `
      Locale nu = (Locale) obj;
      Locale old = (Locale) getDelegate().find_(x, nu.getId());
      if ( old != null &&
           ! SafetyUtil.isEmpty(old.getSpid()) ) {
        old = (Locale) old.fclone();
        old.setTarget(nu.getTarget());
        old.setNote(nu.getNote());
        return getDelegate().put_(x, old);
      }
      return getDelegate().put_(x, nu);
      `
    },
    {
      name: 'getSpid',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'foam.dao.DAOProperty',
      javaCode: `
        String spid = (String) x.get("spid");
        if ( spid == null ) {
          Theme theme = (Theme) ((Themes) x.get("themes")).findTheme(x);
          if ( theme != null ) {
            spid = theme.getSpid();
          }
        }
        return spid;
      `
    },
    {
      name: 'getLocaleDAO',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'spid',
          type: 'String'
        }
      ],
      type: 'foam.dao.DAOProperty',
      javaCode: `
        return ((DAO) x.get("localeDAO")
            .where(
              OR(
               EQ(Locale.SPID, spid),
               EQ(Locale.SPID, "")
              )
            )
            .orderBy(Locale.SPID));
      `
    },
  ]
});
