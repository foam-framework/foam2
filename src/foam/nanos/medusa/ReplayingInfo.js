/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ReplayingInfo',

  implements: [
    'foam.nanos.auth.LastModifiedAware'
  ],

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
      // TODO: protected access to this. See updateIndex for synchronized access.
      documentation: 'Greatest promoted index. See ConsensusDAO.',
      name: 'index',
      class: 'Long',
      visibility: 'RO'
    },
    {
      documentation: 'Index, when received will mark replay complete.',
      name: 'replayIndex',
      class: 'Long',
      visibility: 'RO',
    },
    {
      documentation: 'MedusaEntry has not reached consensus on this index.',
      name: 'nonConsensusIndex',
      class: 'Long',
      visibility: 'RO',
    },
    {
      name: 'replaying',
      class: 'Boolean',
      value: true,
      visibility: 'RO'
    },
    {
      name: 'minIndex',
      class: 'Long',
      visibility: 'RO'
    },
    {
      name: 'maxIndex',
      class: 'Long',
      visibility: 'RO'
    },
    {
      name: 'count',
      class: 'Long',
      visibility: 'RO'
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
      expression: function(startTime) {
        var delta = 0;
        if ( startTime ) {
          delta = new Date().getTime() - startTime.getTime();
        }
        let duration = foam.core.Duration.duration(delta);
        return duration;
      }
    },
    {
      name: 'timeElapsed',
      class: 'String',
      label: 'Elapsed',
      expression: function(index, replayIndex, startTime, endTime) {
        var delta = 0;
        if ( startTime ) {
          let end = endTime || new Date();
          delta = end.getTime() - startTime.getTime();
        }
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
        var timeElapsed = 1;
        if ( startTime ) {
          let end = endTime || new Date();
          timeElapsed = end.getTime() - startTime.getTime();
        }
        let remaining = ( timeElapsed / index ) * replayIndex - timeElapsed;
        let duration = foam.core.Duration.duration(remaining);
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
        let tps = index / tm;
        return Math.round(tps);
      }
    },
    {
      name: 'replayNodes',
      class: 'Map',
      javaFactory: 'return new HashMap();',
      visibility: 'RO'
    },
    {
      name: 'lastModified',
      label: 'Stored',
      class: 'DateTime',
      visibility: 'RO',
      includeInDigest: false,
    }
  ],

  methods: [
    {
      name: 'updateIndex',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'index',
          type: 'Long'
        }
      ],
      synchronized: true,
      javaCode: `
      if ( index > getIndex() ) {
        setIndex(index);
      }
      `
    }
  ]
});
