/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.pool',
  name: 'AbstractFixedThreadPool',
  abstract: true,

  properties: [
    {
      class: 'Int',
      name: 'numberOfThreads',
      value: 16
    },
    {
      class: 'Long',
      name: 'queued'
    },
    {
      class: 'Long',
      name: 'executed'
    },
    {
      class: 'Long',
      name: 'executing'
    }
  ]
});
