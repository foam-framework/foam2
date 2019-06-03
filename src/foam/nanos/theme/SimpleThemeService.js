/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.theme',
  name: 'SimpleThemeService',
  flags: ['java'],

  imports: [
    'themeDAO'
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'java.util.List',
    'static foam.mlang.MLang.DESC',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.TRUE'
  ],

  implements: ['foam.nanos.theme.ThemeService'],

  methods: [
    {
      name: 'getTheme',
      javaCode: `
        DAO themeDAO = ((DAO) getThemeDAO())
          .orderBy(DESC(Theme.PRIORITY));

        // Need to do lookups based on user id and URL. What else might we want
        // to filter Themes by?

        User agent = (User) x.get("agent");
        User user  = (User) x.get("user");
        if ( agent != null && agent.getPersonalTheme() != 0 ) {
          return agent.findPersonalTheme(x);
        } else if ( user != null && user.getPersonalTheme() != 0 ) {
          return user.findPersonalTheme(x);
        }

        // If app name supplied, use that to narrow the search.
        if ( ! SafetyUtil.isEmpty(appName) ) {
          themeDAO = themeDAO.where(EQ(Theme.APP_NAME, appName));
        }

        Theme theme = (Theme) themeDAO.find(TRUE);

        if ( theme == null ) {
          throw new RuntimeException("Could not find an appropriate Theme object.");
        }

        return theme;
      `
    }
  ]
});
