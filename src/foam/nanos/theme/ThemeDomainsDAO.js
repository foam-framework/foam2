/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.theme',
  name: 'ThemeDomainsDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Manage the ThemeDomainDAO, adding, removing mappings as the Theme.domains change.',

  javaImports: [
    'foam.core.FObject',
    'foam.dao.DAO',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'java.util.Arrays',
    'java.util.ArrayList',
    'java.util.List',
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      Theme nu = (Theme) obj;
      Theme old = (Theme) getDelegate().find_(x, nu.getId());
      nu = (Theme) getDelegate().put_(x, nu);
      if ( old != null ) {
        List<String> removed = null;
        List<String> added = null;

        if ( old.getDomains().length > 0 &&
             nu.getDomains().length > 0 ) {
          // compare domains.
          List<String> n = new ArrayList(Arrays.asList(nu.getDomains()));
          removed = new ArrayList(Arrays.asList(old.getDomains()));
          removed.removeAll(n);
          n.removeAll(Arrays.asList(old.getDomains()));
          added = n;
        } else if ( old.getDomains().length > 0 ) {
          removed = Arrays.asList(old.getDomains());
        } else {
          added = Arrays.asList(nu.getDomains());
        }

        DAO dao = (DAO) x.get("themeDomainDAO");
        if ( removed != null ) {
          for ( String domain : removed ) {
            ThemeDomain td = (ThemeDomain) dao.find(domain);
            if ( td != null ) {
              dao.remove(td);
            }
          }
        }
        if ( added != null ) {
          for ( String domain : added ) {
            ThemeDomain td = (ThemeDomain) dao.find(domain);
            if ( td == null ) {
              td = new ThemeDomain();
              td.setId(domain);
              td.setTheme(nu.getId());
              dao.put(td);
            }
          }
        }
      }
      return nu;
      `
    },
    {
      name: 'remove_',
      javaCode: `
      Theme theme = (Theme) obj;
      getDelegate().remove_(x, theme);
      DAO dao = (DAO) x.get("themeDomainDAO");
      for ( Object domain : theme.getDomains() ) {
        ThemeDomain td = (ThemeDomain) dao.find(String.valueOf(domain));
        if ( td != null ) {
          dao.remove(td);
        }
      }
      return theme;
      `
      }
  ]
});
