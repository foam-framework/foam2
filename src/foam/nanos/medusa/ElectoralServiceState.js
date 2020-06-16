/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.medusa',
  name: 'ElectoralServiceState',
  
  documentation: `
        Voting state of a node/instance in a cluster.
      `,
  
  values: [
    {
      name: 'ADJOURNED',
      label: 'Adjourned'
    },
    {
      name: 'ELECTION',
      label: 'Election'
    },
    {
      name: 'VOTING',
      label: 'Voting'
    },
    {
      name: 'IN_SESSION',
      label: 'In session'
    }
  ]
});

