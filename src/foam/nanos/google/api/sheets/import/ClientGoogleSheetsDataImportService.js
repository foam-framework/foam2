foam.CLASS({
  package: 'foam.nanos.google.api.sheets',
  name: 'ClientGoogleSheetsDataImportService',
  implements: [
    'foam.nanos.google.api.sheets.GoogleSheetsDataImportService'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'foam.nanos.google.api.sheets.GoogleSheetsDataImportService',
      name: 'delegate'
    }
  ]
});