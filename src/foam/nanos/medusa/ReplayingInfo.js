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

  requires: [
    // 'foam.core.Duration', -- don't require, triggers Java compilation.
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
    {
      name: 'uptime',
      class: 'String',
      expression: function(startTime, endTime) {
        let delta = new Date().getTime() - startTime.getTime();
        let duration = foam.core.Duration.duration(delta);
        return duration;
      }
    },
    {
      name: 'timeElapsed',
      class: 'String',
      label: 'Elapsed',
      expression: function(index, replayIndex, startTime, endTime) {
        let end = endTime || new Date();
        let delta = end.getTime() - startTime.getTime();
        let duration = foam.core.Duration.duration(delta);
        return duration;
      },
      visibility: 'RO'
    },
    {
      name: 'percentComplete',
      label: '% Complete',
      class: 'Float',
      expression: function(index, replayIndex) {
        if ( replayIndex > index ) {
          return index / replayIndex;
        } else if ( replayIndex > 0 ) {
          return 1;
        }
        return 0;
      },
      visibility: 'RO'
    },
    {
      name: 'timeRemaining',
      class: 'String',
      label: 'Remaining',
      expression: function(index, replayIndex, startTime, endTime) {
        let end = endTime || new Date();
        let tm = end.getTime() - startTime.getTime();
        let tpm = replayIndex / tm;
        let m = (replayIndex - index) / tpm;
        let duration = foam.core.Duration.duration(m);
        return duration;
      },
      visibility: 'RO'
    },
    {
      name: 'replayTps',
      class: 'String',
      expression: function(index, replayIndex, startTime, endTime) {
        let end = endTime || new Date();
        let tm = (end.getTime() - startTime.getTime()) / 1000;
        let tps = replayIndex / tm;
        return Math.round(tps);
      }
    },
    {
      name: 'tps',
      class: 'String',
      expression: function(index, replayIndex, endTime) {
        var tps = 0;
        if ( endTime ) {
          let now = new Date();
          let end = endTime || new Date();
          let tm = (now.getTime() - end.getTime()) / 1000;
          tps = (index - replayIndex) / tm;
        }
        return Math.round(tps);
      }
    },
    {
      name: 'replayNodes',
      class: 'Map',
      javaFactory: 'return new HashMap();',
      visibility: 'RO',
    }
  ]
});
