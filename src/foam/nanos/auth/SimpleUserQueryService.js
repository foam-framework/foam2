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
    'foam.core.X',
    'java.util.ArrayList',
    'java.util.concurrent.ConcurrentHashMap',
    'java.util.List',
    'java.util.Map',
    'foam.core.Detachable',
    'java.util.HashMap',
    'java.util.Set',
    'java.util.HashSet',
    'foam.core.FObject',
    'foam.dao.Sink',
    'foam.dao.ArraySink',
    'foam.nanos.logger.Logger',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.liquidity.crunch.ApproverLevel',
    'net.nanopay.liquidity.crunch.GlobalLiquidCapability'
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
        },
        {
          name: 'requestingUser',
          type: 'foam.nanos.auth.User'
        }
      ],
      javaCode: `  
      DAO groupDAO = (DAO) x.get("groupDAO");
          
      Logger logger = (Logger) x.get("logger");

      String groupName = requestingUser.getGroup();

      Group currentGroup = (Group) groupDAO.find(groupName);

      List usersInGroup = ((ArraySink) currentGroup.getUsers(x).select(new ArraySink())).getArray();
      
      return usersInGroup;
      `
    }
  ]
});
