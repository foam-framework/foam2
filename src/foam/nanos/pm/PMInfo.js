/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.pm',
  name: 'PMInfo',

  documentation: 'Performance Measurement database entry.',

  ids: [ 'clsname', 'pmname' ],

  properties: [
    {
      class: 'String',
      name: 'clsname'
    },
    {
      class: 'String',
      name: 'pmname'
    },
    {
      class: 'Long',
      name: 'mintime'
    },
    {
      class: 'Long',
      name: 'maxtime'
    },
    {
      class: 'Long',
      name: 'totaltime'
    },
    {
      class: 'Int',
      name: 'numoccurrences'
    }
  ]
});
