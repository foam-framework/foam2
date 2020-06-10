/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'UserTwoFactoryRefinement',
  refines: 'foam.nanos.auth.User',

  properties: [
    {
      class: 'Boolean',
      name: 'twoFactorEnabled',
      documentation: 'Two factor enabled flag',
      section: 'administrative'
    },
    {
      class: 'String',
      name: 'twoFactorSecret',
      documentation: 'Two factor secret',
      networkTransient: false, // todo: change it back to true after fixing NP-1278
      section: 'administrative'
    }
  ]
});
