/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'UserPropertyAvailabilityService',

  documentation: 
    `This is a service that checks whether a user with matching values for a unique given property
    (ie. Username/Email) already exists in the system. Thus, this service allows the client to check
    the availability of these property values.
    `,

  implements: [
    'foam.nanos.auth.UserPropertyAvailabilityServiceInterface'
  ],

  imports: [
    'DAO localUserDAO'
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.predicate.Predicate'
  ],

  methods: [
    {
      name: 'checkAvailability',
      javaCode: `
        DAO userDAO = (DAO) getX().get("localUserDAO");
        
        ArraySink select = (ArraySink) userDAO.inX(x).where((Predicate) predicate).select(new ArraySink());
        
        if ( select.getArray().size() != 0 ) {
          return false;
        }
        return true;
      `
    }  
  ]
});
