foam.INTERFACE({
  package: 'foam.nanos.google.api.sheets',
  name: 'GoogleSheetsDataImportService',
  methods: [
    {
      name: 'getColumns',
      javaType: 'String[]',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'importConfig',
          type: 'foam.nanos.google.api.sheets.GoogleSheetsImportConfig'
        }
      ]
    },
    {
      name: 'importData',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'importConfig',
          type: 'foam.nanos.google.api.sheets.GoogleSheetsImportConfig'
        }
      ]
    }
  ]
});