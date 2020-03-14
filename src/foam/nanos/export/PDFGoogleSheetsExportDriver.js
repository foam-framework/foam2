/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.export',
  name: 'PDFGoogleSheetsExportDriver',

  implements: [ 'foam.nanos.export.ExportDriver' ],

  requires: [
    'foam.nanos.export.GoogleSheetsOutputter'
  ],

  properties: [
    {
      name: 'outputter',
      factory: function() {
        return this.GoogleSheetsOutputter.create();
      }
    }
  ],
  methods: [
    async function exportFObject(X, obj) {
        var self = this;
        
        var url  = '';
        var stringArray = [];
        var props = X.filteredTableColumns ? X.filteredTableColumns : self.outputter.getAllPropertyNames(dao.of);
        var metadata = self.outputter.getColumnMethadata(dao.of, props);
        stringArray.push(metadata.map(m => m.columnLabel));
        var values = self.outputter.outputArray([ obj ], metadata);
        stringArray = stringArray.concat(values);

        url = await X.googleSheetsDataExport.exportPdf(stringArray, metadata);
        return url;
    },
    async function exportDAO(X, dao) {
      var self = this;
      
      var sink = await dao.select();
      var url  = '';
      var stringArray = [];
      var props = X.filteredTableColumns ? X.filteredTableColumns : self.outputter.getAllPropertyNames(dao.of);
      var metadata = self.outputter.getColumnMethadata(dao.of, props);
      stringArray.push(metadata.map(m => m.columnLabel));
      var values = self.outputter.outputArray(sink.array, metadata);
      stringArray = stringArray.concat(values);

      url = await X.googleSheetsDataExport.exportPdf(stringArray, metadata);
      return url;
    }
  ]
});