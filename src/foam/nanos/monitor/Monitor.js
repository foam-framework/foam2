/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.monitor',
  name: 'Monitor',

  documentation: '',

  implements: [
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  javaImports: [
    'foam.core.X'
  ],

  tableColumns: [
    'enabled',
    'key',
    'name',
    'desc',
    'schedule',
    'lastRun'
  ],

  searchColumns: [
    'key',
    'name',
    'desc'
  ],

  properties: [
    {
      documentation: `generated unique id`,
      name: 'id',
      class: 'String',
      visibility: 'RO'
    },
    {
      documentation: `Enabled Aware, Monitor is ignored unless enabled.`,
      name: 'enabled',
      class: 'Boolean'
    },
    {
      documentation: ``,
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
      name: 'desc',
      //label: 'Description',
      class: 'String',
      tableWidth: 100
    },
    {
      name: 'runInterval',
      class: 'Long'
    },
    {
      name: 'schedule',
      class: 'DateTime'
    },
    {
      name: 'lastRun',
      class: 'DateTime'
    },
    {
      name: 'alarm',
      label: 'Status',
      class: 'Reference',
      of: 'foam.nanos.monitor.Alarm',
      visibility: 'RO'
    },
    // { TODO: also notification, notificationRepeatUntilAcknowledged,
    //   name: 'notifyOnChange',
    //   class: 'Boolean',
    //   value: false
    // },
    {
      name: 'created',
      class: 'DateTime',
      visibility: 'RO'
    },
    {
      name: 'createdBy',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      visibility: 'RO'
    },
    {
      name: 'lastModified',
      class: 'DateTime',
      visibility: 'RO'
    },
    {
      name: 'lastModifiedBy',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      visibility: 'RO'
    },

  ]
});
