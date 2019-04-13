/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.build',
  name: 'Library',
  ids: ['name', 'iteration'],
  properties: [
    {
      name: 'name'
    },
    {
      class: 'Int',
      name: 'iteration',
      value: 0
    },
    {
      name: 'order'
    },
    {
      name: 'flags'
    },
    {
      name: 'methods'
    },
    {
      name: 'constants'
    }
  ]
});
