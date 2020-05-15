/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'SimpleUserQueryService',
  documentation: `
    Defaults to grabbing all users in the requestingUser's group to denote as approvers
  `,

  implements: [
    'foam.nanos.auth.UserQueryService'
  ],

  javaImports: [
    'foam.core.Detachable',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',

    'java.util.ArrayList',
    'java.util.HashMap',
    'java.util.HashSet',
    'java.util.List',
    'java.util.Map',
    'java.util.Set',
    'java.util.concurrent.ConcurrentHashMap'
  ],

  methods: [
    {
      name: 'getAllApprovers',
      async: true,
      type: 'List',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'modelToApprove',
          type: 'String'
        }
      ],
      javaCode: `
      DAO groupDAO = (DAO) x.get("groupDAO");

      Logger logger = (Logger) x.get("logger");

      User user = ((Subject) x.get("subject")).getUser();

      String groupName = user.getGroup();

      Group currentGroup = (Group) groupDAO.find(groupName);

      List usersInGroup = ((ArraySink) currentGroup.getUsers(x).select(new ArraySink())).getArray();

      return usersInGroup;
      `
    }
  ]
});
