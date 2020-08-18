/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'FileType',
  documentation: 'type of file such as PDF, JPGE, CSV',

  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'fileName',
    },
    {
      class: 'String',
      name: 'mime',
    }
  ]
});
