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
    (restricted use for Username and Email) already exists in the system. Thus, this service allows the client to check
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
    'foam.mlang.MLang',
    'foam.mlang.MLang.*',
    'foam.nanos.auth.User'
  ],

  methods: [
    {
      name: 'checkAvailability',
      javaCode: `
        DAO userDAO = (DAO) getX().get("localUserDAO");

        if ( ! targetProperty.equals("userName") && ! targetProperty.equals("email") ) {
          throw new RuntimeException("Unsupported use of UserPropertyAvailabilityService.");
        }

        ArraySink select = (ArraySink) userDAO.inX(x).where(MLang.EQ(targetProperty.equals("userName") ? User.USER_NAME : User.EMAIL, value)).select(new ArraySink());
        
        if ( select.getArray().size() != 0 ) {
          return false;
        }
        return true;
      `
    }  
  ]
});
