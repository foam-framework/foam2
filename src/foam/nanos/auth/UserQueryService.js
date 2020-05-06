/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'UserQueryService',
  documentation: `
    Can be used to query types of users which can vary in meaning across different applications.
    In a simple app the approvers can just be everyone in a specific Approver group or the user's own group.
    In a more complex app the approvers can be based on possessing specific capabilities.
  `,

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
      ]
    },
  ]
});
