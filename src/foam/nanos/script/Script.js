/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.test',
  name: 'Script',

  implements: [ 'foam.pattern.EnabledAware' ],

  ids: [ 'name' ],

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'DateTime',
      name: 'lastRun'
    },
    {
      class: 'String',
      name: 'notes',
      displayHeight: 20
    },
    {
      class: 'String',
      name: 'code',
      displayHeight: 20
    },
    {
      class: 'String',
      name: 'output',
      visibility: foam.u2.Visibility.RO,
      displayHeight: 20
    }
  ]
});
