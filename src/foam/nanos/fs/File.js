/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'File',

  documentation: 'Represents a file',

  properties: [
    {
      class: 'String',
      name: 'id',
      documentation: 'GUID'
    },
    {
      class: 'String',
      name: 'filename',
      documentation: 'Filename'
    },
    {
      class: 'Long',
      name: 'filesize',
      documentation: 'Filesize'
    },
    {
      class: 'String',
      name: 'mimeType',
      documentation: 'File mime type'
    },
    {
      class: 'Blob',
      name: 'data',
      documentation: 'File data'
    }
  ]
});
