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
