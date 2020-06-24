/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ReplayingInfo',

  javaImports: [
    'java.util.HashMap',
    'java.util.Map'
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      visibility: 'RO',
//      class: 'Reference',
//      of: 'foam.nanos.medusa.ClusterConfig'
    },
    {
      documentation: 'Greatest promoted index.',
      name: 'index',
      class: 'Long',
      visibility: 'RO',
    },
    {
      documentation: 'Index, when received will mark replay complete.',
      name: 'replayIndex',
      class: 'Long',
      visibility: 'RO',
    },
    {
      name: 'replaying',
      class: 'Boolean',
      value: true,
      visibility: 'RO',
    },
    {
      name: 'replayNodes',
      class: 'Map',
      javaFactory: 'return new HashMap();',
      visibility: 'RO',
    },
    {
      name: 'startTime',
      class: 'Date',
      visibility: 'RO'
    },
    {
      name: 'endTime',
      class: 'Date',
      visibility: 'RO'
    }
  ]
});
