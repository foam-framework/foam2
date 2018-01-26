/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'File',

  documentation: 'Represents a file',

  ids: [ 'data' ],

  properties: [
    {
      class: 'String',
      name: 'filename',
      documentation: 'Filename'
    },
    {
      class: 'String',
      name: 'mimeType',
      documentation: 'File mime type'
    },
    {
      class: 'Reference',
      of: 'foam.blob.Blob',
      name: 'data',
      documentation: 'File data'
    }
  ]
});
