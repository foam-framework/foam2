/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao.history',
  name: 'HistoryRecord',
  documentation: `Contains an array of property updates`,
  javaImports: [
    'java.util.ArrayList'
  ],
  properties: [
    {
      class: 'ArrayList',
      of: 'PropertyUpdate',
      name: 'updates'
    }
  ],

  methods: [
    {
      name: 'addUpdate',
      args: [
        {
          name: 'obj',
          javaType: 'PropertyUpdate'
        }
      ],
      javaCode: `getUpdates().add(obj);`
    }
  ]
});
