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
      of: 'foam.dao.history.PropertyUpdate',
      name: 'updates'
    }
  ]
});
