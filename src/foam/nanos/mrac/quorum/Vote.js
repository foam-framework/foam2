/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.mrac.quorum',
  name: 'Vote',
  documentation: '',
  
  properties: [
    {
      class: 'Long',
      name: 'primaryInstanceId'
    },
    {
      class: 'Long',
      name: 'electionEra'
    },
    {
      class: 'Long',
      name: 'primaryEra'
    },
    {
      class: 'Long',
      name: 'criteria',
      documentation: 'Primary electing criteria.'
    }
  ]
  
});