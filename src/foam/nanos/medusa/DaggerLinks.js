/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'DaggerLinks',

  documentation: `Represents the 'next' index available and the two DAG index/hashes used in the calculation of the 'next' index hash.`,

  properties: [
    {
      documentation: 'next global index',
      name: 'globalIndex',
      class: 'Long'
    },
    {
      name: 'link1',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.DaggerLink'
    },
    {
      name: 'link2',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.DaggerLink'
    }
  ]
});
