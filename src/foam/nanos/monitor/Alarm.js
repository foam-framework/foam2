/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.monitor',
  name: 'Alarm',

  documentation: ``,

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.LastModifiedAware'
  ],

  javaImports: [
    'foam.core.X'
  ],

  tableColumns: [
    'key',
    'name',
    'message',
    'count',
    'lastModified'
  ],

  searchColumns: [
    'key',
    'name',
    'message'
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      visibility: 'RO'
    },
    {
      name: 'key',
      class: 'String',
      tableWidth: 30
    },
    {
      name: 'name',
      class: 'String',
      tableWidth: 100
    },
    {
      name: 'message',
      class: 'String',
      tableWidth: 100
    },
    {
      name: 'repeated',
      class: 'Long'
    },
    {
      name: 'created',
      class: 'DateTime'
    },
    {
      name: 'lastModified',
      class: 'DateTime'
    },
    // TODO: acknowledged, acknowledgedBy, acknowledgedAction
    // TODO: notification -
    // {
    //   name: 'clearsAlarm',
    //   class: 'Reference',
    //   of: 'foam.nanos.monitor.Alarm',
    //   visibility: 'RO'
    // }
  ]
});
