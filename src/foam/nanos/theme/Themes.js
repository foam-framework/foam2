/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.theme',
  name: 'Themes',

  documentation: `Support methods for Theme`,

  axioms: [ foam.pattern.Singleton.create() ],

  requires: [
    'foam.nanos.theme.ThemeDomain',
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Group',
    'javax.servlet.http.HttpServletRequest',
    'org.eclipse.jetty.server.Request'
  ],

  methods: [
    {
      documentation: `Acquire theme through users spid.`,
      name: 'findTheme',
      type: 'foam.nanos.theme.Theme',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      code: async function(x) {
        var theme;
        var user = x.user;
        if ( user ) {
          theme = await user.theme$find;
          if ( theme ) return theme;
          var group = await user.group$find;
          while ( group ) {
            theme = await group.theme$find;
            if ( theme ) return theme;
            group = await group.parent$find;
          }
        }
        var domain = window && window.location.hostname || 'localhost';
        if ( domain ) {
          var themeDomain = await x.themeDomainDAO.find(domain);
          if ( themeDomain ) {
            var predicate = foam.nanos.mlang.AND(
              foam.mlang.EQ(foam.nanos.theme.Theme.ID, themeDomain.theme),
              foam.mlang.EQ(foam.nanos.theme.Theme.ENABLED, true)
            );
            theme = await x.themeDAO.find(predicate);
            if ( theme ) return theme;
          }
        }
        console.warning('Theme not found: '+domain);
        return foam.nanos.theme.Theme.create({ 'name': 'foam', 'appName': 'FOAM' });
      },
      javaCode: `
      DAO groupDAO = (DAO) x.get("groupDAO");
      Theme theme = (Theme) x.get("theme");
      if ( theme != null ) return theme;
      User user = (User) x.get("user");
      if ( user != null ) {
        theme = user.findTheme(x);
        if ( theme != null ) return theme;
        Group group = user.findGroup(x);
        while ( group != null ) {
          theme = group.findTheme(x);
          if ( theme != null ) return theme;
          group = (Group) groupDAO.find(group.getParent());
        }
      }
      String domain = "localhost";
      HttpServletRequest req = x.get(HttpServletRequest.class);
      if ( req != null ) {
        domain = req.getServerName();
      }
      ThemeDomain td = (ThemeDomain) ((DAO) x.get("themeDomainDAO")).find(domain);
      if ( td != null ) {
        theme = (Theme) ((DAO) x.get("themeDAO")).find(
          foam.mlang.MLang.AND(
            foam.mlang.MLang.EQ(Theme.ID, td.getTheme()),
            foam.mlang.MLang.EQ(Theme.ENABLED, true)
          ));
        if ( theme != null ) return theme;
      }
      ((foam.nanos.logger.Logger) x.get("logger")).warning("Theme not found.", req.getServerName());
      return new Theme.Builder(x).setName("foam").setAppName("FOAM").build();
      `
    }
  ]
});
