/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.export',
  name: 'ClientGoogleSheetsExportService',

  implements: [
    'foam.nanos.export.GoogleSheetsExport'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'foam.nanos.export.GoogleSheetsExport',
      name: 'delegate'
    }
  ]
});
