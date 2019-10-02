/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.rope',
  name: 'ROPEAuthorizer',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Authorizer',
    'foam.nanos.auth.User',
    'foam.nanos.rope.ROPE',
    'foam.nanos.rope.ROPEActions',
    'java.lang.reflect.*',
    'java.util.ArrayList',
    'java.util.List'
  ],

  properties: [
    {
      name: 'user_',
      class: 'Object',
      javaType: 'User'
    },
    {
      name: 'ropeDAO_',
      class: 'Object',
      javaType: 'DAO'
    },
    {
      name: 'targetDAOKey_',
      class: 'String'
    }
  ],

})