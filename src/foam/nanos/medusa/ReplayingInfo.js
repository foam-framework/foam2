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
      visibility: 'HIDDEN',
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
      name: 'startTime',
      class: 'Date',
      visibility: 'HIDDEN'
    },
    {
      name: 'endTime',
      class: 'Date',
      visibility: 'HIDDEN'
    },
    // uptime, ...
    {
      name: 'duration',
      expression: function(index, replayIndex, startTime, endTime) {
        let time = endTime || new Date();
        let delta = time.getTime() - startTime.getTime();
        let eta = this.Duration.create().format(delta);
        return eta;
      },
      visibility: 'RO'
    },
    {
      name: 'percentComplete',
      label: 'PC',
      expression: function(index, replayIndex) {
        return replayIndex ? index / replayIndex : 0;
      },
      visibility: 'RO'
    },
    {
      name: 'eta',
      label: 'ETA',
      expression: function(index, replayIndex, startTime) {
        let delta = Date.now() - startTime.getTime();
        let rate = index / delta;
        let t = rate * (replayIndex - index); // ms
        let eta = this.Duration.create().format(t);
        return eta;
      },
      visibility: 'RO'
    },
    {
      name: 'replayNodes',
      class: 'Map',
      javaFactory: 'return new HashMap();',
      visibility: 'RO',
    }
  ]
});
