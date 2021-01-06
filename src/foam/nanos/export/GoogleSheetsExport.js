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
      name: 'createSheetAndPopulateWithData',
      type: 'String',
      javaThrows: [ 'java.lang.Exception' ],
      async: true,
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'metadataObj',
          type: 'foam.nanos.export.GoogleSheetsPropertyMetadata[]',
          javaType: 'Object'
        },
        {
          name: 'extraConfig',
          type: 'Object',
          javaType: 'foam.nanos.export.GoogleSheetsServiceConfig'
        }
      ]
    },
    {
      name: 'createSheetByCopyingTemplate',
      type: 'String',
      javaThrows: [ 'java.lang.Exception' ],
      async: true,
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'metadataObj',
          type: 'foam.nanos.export.GoogleSheetsPropertyMetadata[]',
          javaType: 'Object'
        },
        {
          name: 'extraConfig',
          type: 'foam.nanos.export.GoogleSheetsServiceConfig'
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
    },
    {
      name: 'createSheetAndPopulateWithFrontEndData',
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
          javaType: 'Object'
        },
        {
          name: 'metadataObj',
          type: 'foam.nanos.export.GoogleSheetsPropertyMetadata[]',
          javaType: 'Object'
        },
        {
          name: 'extraConfig',
          type: 'Object',
          javaType: 'foam.nanos.export.GoogleSheetsServiceConfig'
        }
      ]
    },
    {
      name: 'createSheetByCopyingTemplateAndFronEndData',
      javaType: 'String',
      javaThrows: [ 'java.lang.Exception' ],
      async: true,
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'obj',
          javaType: 'Object'
        },
        {
          name: 'metadataObj',
          type: 'foam.nanos.export.GoogleSheetsPropertyMetadata[]',
          javaType: 'Object'
        },
        {
          name: 'extraConfig',
          type: 'foam.nanos.export.GoogleSheetsServiceConfig'
        }
      ]
    }
  ]
});