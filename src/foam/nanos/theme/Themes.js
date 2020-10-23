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
    'foam.mlang.MLang',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'javax.servlet.http.HttpServletRequest',
    'org.eclipse.jetty.server.Request'
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
        var themeDomain;
        var domain = window && window.location.hostname || 'localhost';
        var user = x.subject.user;
        if ( domain ) {
          themeDomain = await this.themeDomainDAO.find(domain);
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

        if ( user && ( ! theme || domain !== themeDomain.id ) ) {
          var spid = user.spid;
          while ( spid ) {
            theme = await this.themeDAO.find(
              this.AND(
                this.EQ(foam.nanos.theme.Theme.SPID, spid),
                this.EQ(foam.nanos.theme.Theme.ENABLED, true)));
            if ( theme ) break;

            var pos = spid.lastIndexOf('.');
            spid = spid.substring(0, pos > 0 ? pos : 0);
          }

          if ( ! theme ) {
            theme = await this.themeDAO.find(
              this.AND(
                this.EQ(foam.nanos.theme.Theme.SPID, '*'),
                this.EQ(foam.nanos.theme.Theme.ENABLED, true)));
          }
        }

        if ( ! theme ) {
          console && console.warn('Theme not found: '+ domain);
        }

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
      DAO themeDAO = ((DAO) x.get("themeDAO"));
      Theme theme = null;
      ThemeDomain td = null;
      String domain = null;
      User user = ((Subject) x.get("subject")).getUser();
      HttpServletRequest req = x.get(HttpServletRequest.class);
      if ( req != null ) {
        domain = req.getServerName();
      }

      // Find theme from themeDomain via domain
      if ( domain != null ) {
        var themeDomainDAO = (DAO) x.get("themeDomainDAO");
        td = (ThemeDomain) themeDomainDAO.find(domain);
        if ( td == null &&
             ! "localhost".equals(domain) ) {
          td = (ThemeDomain) themeDomainDAO.find("localhost");
        }
        if ( td != null ) {
          theme = (Theme) themeDAO.find(
            MLang.AND(
              MLang.EQ(Theme.ID, td.getTheme()),
              MLang.EQ(Theme.ENABLED, true)
            ));
        }
      }

      // Find theme from user via SPID
      if ( user != null
        && ( theme == null || ! domain.equals(td.getId()) )
      ) {
        var spid = user.getSpid();
        while ( ! SafetyUtil.isEmpty(spid) ) {
          theme = (Theme) themeDAO.find(
            MLang.AND(
              MLang.EQ(Theme.SPID, spid),
              MLang.EQ(Theme.ENABLED, true)
            )
          );
          if ( theme != null ) break;

          var pos = spid.lastIndexOf(".");
          spid = spid.substring(0, pos > 0 ? pos : 0);
        }
      }

      if ( theme == null ) {
        ((foam.nanos.logger.Logger) x.get("logger")).warning("Theme not found.",
          "domain:" + (req != null ? req.getServerName() : ""),
          "user:" + user.getId());
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
