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

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.nanos.theme.ThemeDomain',
  ],

  imports: [
    'themeDAO',
    'themeDomainDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'javax.servlet.http.HttpServletRequest',
    'org.eclipse.jetty.server.Request',
    'static foam.mlang.MLang.EQ'
  ],

  methods: [
    {
      documentation: `Acquire theme through users spid.
Later themes:
1. domain
2. group
3. user`,
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
        var domain = window && window.location.hostname || 'localhost';
        if ( domain ) {
          var themeDomain = await this.themeDomainDAO.find(domain);
          if ( ! themeDomain &&
               'localhost' != domain ) {
            themeDomain = await this.themeDomainDAO.find('localhost');
          }
          if ( themeDomain ) {
            var predicate = this.AND(
              this.EQ(foam.nanos.theme.Theme.ID, themeDomain.theme),
              this.EQ(foam.nanos.theme.Theme.ENABLED, true)
            );
            theme = await this.themeDAO.find(predicate);
          }
        }
        if ( ! theme ) {
          console && console.warn('Theme not found: '+domain);
        }

        var user = x.user;
        var group = x.group;
        if ( user && group ) { // non-null when logged in.
          var group = await user.group$find;
          while ( group ) {
            var groupTheme = await group.theme$find;
            if ( groupTheme ) {
              theme = theme && theme.copyFrom(groupTheme) || theme;
              if ( !! group.defaultMenu ) {
                theme.defaultMenu = group.defaultMenu;
              }
            }
            group = await group.parent$find;
          }
          var userTheme = await user.theme$find;
          if ( userTheme ) {
            theme = theme && theme.copyFrom(userTheme) || theme;
          }
        }
        if ( theme ) {
          return theme;
        }
        return foam.nanos.theme.Theme.create({ 'name': 'foam', 'appName': 'FOAM' });
      },
      javaCode: `
      Theme theme = null;
      User user = ((Subject) x.get("subject")).getUser();
      String domain = user != null && ! SafetyUtil.isEmpty(user.getSpid())
                        ? user.getSpid() : "localhost";
      HttpServletRequest req = x.get(HttpServletRequest.class);
      if ( req != null ) {
        domain = req.getServerName();
      }

      DAO themeDomainDAO = (DAO) x.get("themeDomainDAO");
      ThemeDomain td = (ThemeDomain) themeDomainDAO.find(domain);
      if ( td == null &&
           ! "localhost".equals(domain) ) {
        td = (ThemeDomain) themeDomainDAO.find(EQ(ThemeDomain.SPID, domain));
        if ( td == null ) {
          td = (ThemeDomain) themeDomainDAO.find("localhost");
        }
      }
      if ( td != null ) {
        theme = (Theme) ((DAO) x.get("themeDAO")).find(
          foam.mlang.MLang.AND(
            foam.mlang.MLang.EQ(Theme.ID, td.getTheme()),
            foam.mlang.MLang.EQ(Theme.ENABLED, true)
          ));
      }
      if ( theme == null ) {
        ((foam.nanos.logger.Logger) x.get("logger")).warning("Theme not found.", req != null ? req.getServerName() : "");
        theme = new Theme.Builder(x).setName("foam").setAppName("FOAM").build();
      }

      // Augment the theme with group and user themes
      if ( user != null ) {
        DAO groupDAO = (DAO) x.get("groupDAO");
        Group group = user.findGroup(x);
        while ( group != null ) {
          Theme groupTheme = group.findTheme(x);
          if ( groupTheme != null ) {
            theme = (Theme) theme.fclone().copyFrom(groupTheme);
            if ( ! SafetyUtil.isEmpty(group.getDefaultMenu()) ) {
              theme.setDefaultMenu(group.getDefaultMenu());
            }
          }
          group = (Group) groupDAO.find(group.getParent());
        }
        Theme userTheme = user.findTheme(x);
        if ( userTheme != null ) {
          theme = (Theme) theme.fclone().copyFrom(userTheme);
        }
      }

      return theme;
      `
    }
  ]
});
