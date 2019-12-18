/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.mrac',
  name: 'FileMeta',

  documentation: 'This model use to store metadata of a File',

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'Object',
      name: 'fileLock',
      documentation: 'Use ReadWriteLock, because there may be more machine replaying concurrently.'
    }
  ]
});