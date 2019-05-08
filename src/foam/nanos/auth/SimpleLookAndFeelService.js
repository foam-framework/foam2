/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'SimpleLookAndFeelService',
  flags: ['java'],

  imports: [
    'lookAndFeelDAO'
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

  implements: ['foam.nanos.auth.LookAndFeelService'],

  methods: [
    {
      name: 'getLookAndFeel',
      javaCode: `
        DAO lookAndFeelDAO = ((DAO) getLookAndFeelDAO())
          .orderBy(DESC(LookAndFeel.PRIORITY));

        // Need to do lookups based on user id and URL. What else might we want
        // to filter LookAndFeels by?

        User agent = (User) x.get("agent");
        User user  = (User) x.get("user");
        if ( agent != null && agent.getPersonalLookAndFeel() != 0 ) {
          return agent.findPersonalLookAndFeel(x);
        } else if ( user != null && user.getPersonalLookAndFeel() != 0 ) {
          return user.findPersonalLookAndFeel(x);
        }

        // If app name supplied, use that to narrow the search.
        if ( ! SafetyUtil.isEmpty(appName) ) {
          lookAndFeelDAO = lookAndFeelDAO.where(EQ(LookAndFeel.APP_NAME, appName));
        }

        LookAndFeel laf = (LookAndFeel) lookAndFeelDAO.find(TRUE);

        if ( laf == null ) {
          throw new RuntimeException("Could not find an appropriate LookAndFeel object.");
        }

        return laf;
      `
    }
  ]
});
