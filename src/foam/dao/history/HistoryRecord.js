/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao.history',
  name: 'HistoryRecord',

  documentation: 'Contains an array of property updates',
  ids: [ 'objectId', 'seqNo' ],

  tableColumns: [
    'timestamp',
    'objectId',
    'user',
    'updates'
  ],

  properties: [
    {
      class: 'Long',
      name: 'seqNo',
      hidden: true
    },
    {
      class: 'Object',
      name: 'objectId',
      label: 'Updated Object',
      documentation: 'Id of object related to history record.',
      tableWidth: 150
    },
    {
      class: 'String',
      name: 'user',
      label: 'Updated By',
      documentation: 'User that made the update.',
      tableWidth: 200
    },
    {
      class: 'String',
      name: 'agent',
      label: 'Updated By',
      documentation: 'Agent that made the update'
    },
    {
      class: 'DateTime',
      name: 'timestamp',
      documentation: 'Date and time history record was created.',
      tableWidth: 200
    },
    {
      class: 'FObjectArray',
      of: 'foam.dao.history.PropertyUpdate',
      name: 'updates',
      label: 'Updated Properties',
      documentation: 'Properties updated, contains new and old values.'
    }
  ]
});
