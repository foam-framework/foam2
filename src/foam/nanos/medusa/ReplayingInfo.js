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
      name: 'timeElapsed',
      class: 'String',
      label: 'Elapsed',
      expression: function(index, replayIndex, startTime, endTime) {
        let time = endTime || new Date();
        let delta = time.getTime() - startTime.getTime();
        let eta = foam.core.Duration.create({value: delta}).formatted();
        return eta;
      },
      visibility: 'RO'
    },
    {
      name: 'percentComplete',
      label: '% Complete',
      class: 'Float',
      expression: function(index, replayIndex) {
        if ( replayIndex > index ) {
          return ((index / replayIndex) * 100).toFixed(2);
        } else if ( replayIndex > 0 ) {
          return '100';
        }
        return '0';
      },
      visibility: 'RO'
    },
    {
      name: 'timeRemaining',
      class: 'String',
      label: 'Remaining',
      expression: function(index, replayIndex, startTime) {
        let delta = Date.now() - startTime.getTime();
        let rate = index / delta;
        let t = rate * (replayIndex - index); // ms
        let eta = foam.core.Duration.create({value: t}).formatted();
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
