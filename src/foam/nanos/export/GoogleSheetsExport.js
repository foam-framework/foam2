/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.export',
  name: 'GoogleSheetsExport',
  methods: [
    {
      name: 'createSheet',
      type: 'String',
      javaThrows: [ 'java.lang.Exception' ],
      async: true,
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'obj',
          type: 'Object'
        },
        {
          name: 'metadataObj',
          type: 'foam.nanos.export.GoogleSheetsPropertyMetadata[]',
          javaType: 'Object'
        }
      ]
    },
    {
      name: 'deleteSheet',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'sheetId',
          type: 'String'
        }
      ],
      javaThrows: [ 'java.io.IOException', 'java.security.GeneralSecurityException' ]
    }
  ]
});