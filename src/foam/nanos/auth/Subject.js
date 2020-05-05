/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Subject',

  javaImports: [
    'java.util.Stack'
  ],

  properties: [
    {
      class: 'foam.nanos.auth.User',
      name: 'user',
      documentation: 'Authenticated user'
    },
    {
      class: 'foam.nanos.auth.User',
      name: 'effectiveUser',
      documentation: 'Current user role(acts as effectiveUser)',
      javaSetter: `
      java.util.ArrayList userPath = getUserPath();
      if ( userPath.size() < 2 || val != (foam.nanos.auth.User) userPath.get(userPath.size() - 1) ) {
        userPath.add(val);
      }
      else {
        userPath.remove(userPath.size());
      }
      `
    },
    {
      class: 'List',
      javaType: 'java.util.ArrayList<foam.nanos.auth.User>',
      name: 'userPath',
      documentation: 'path from user to effectiveUser',
      javaFactory: 'return new java.util.ArrayList();'
    },
  ],

  methods: [
    {
      name: 'toString',
      type: 'String',
      javaCode: `
        return "hahaha";
`
     }
  ]
})
