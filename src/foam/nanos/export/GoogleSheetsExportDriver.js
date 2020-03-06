foam.CLASS({
  package: 'foam.nanos.export',
  name: 'GoogleSheetsExportDriver',
  implements: [ 'foam.nanos.export.ExportDriver' ],

  imports: [
    'googleSheetsDataExport'
  ],

  methods: [
    function exportFObject(X, obj) {
      return '';
    },
    function exportDAO(X, obj) {
      var url  =  this.googleSheetsDataExport.createSheet();
      if(url) {
        window.location.assign(url);
      }
    }
  ]
});