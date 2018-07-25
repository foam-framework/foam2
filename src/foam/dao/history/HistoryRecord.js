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
  
  properties: [
    {
      class: 'Long',
      name: 'seqNo'
    },
    {
      class: 'Object',
      name: 'objectId',
      documentation: 'Id of object related to history record.'
    },
    {
      class: 'String',
      name: 'user'
    },
    {
      class: 'DateTime',
      name: 'timestamp',
      documentation: 'Date and time history record was created.'
    },
    {
      class: 'FObjectArray',
      of: 'foam.dao.history.PropertyUpdate',
      name: 'updates',
      documentation: 'Properties updated, contains new and old values.'
    }
  ]
});
