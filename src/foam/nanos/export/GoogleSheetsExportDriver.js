foam.CLASS({
  package: 'foam.nanos.export',
  name: 'GoogleSheetsExportDriver',
  implements: [ 'foam.nanos.export.ExportDriver' ],

  requires: [
    'foam.nanos.export.GoogleSheetsExport',
    'foam.nanos.export.GoogleSheetsExportService',
    'foam.nanos.export.ClientGoogleSheetsExportService',
    'foam.box.HTTPBox'
  ],

  methods: [
    function exportFObject(X, obj) {
      return '';
    },
    {
      name: 'exportDAO',
      code: async function(X, obj) {
      var url  =  await X.googleSheetsDataExport.createSheet();
      if(url) {
        window.location.assign(url);
      }
    }
    }
  ]
});