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
      class: 'String',
      name: 'objectId'
    },
    {
      class: 'String',
      name: 'user'
    },
    {
      class: 'DateTime',
      name: 'timestamp'
    },
    {
      class: 'FObjectArray',
      of: 'PropertyUpdate',
      name: 'updates'
    }
  ]
});
