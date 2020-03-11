foam.CLASS({
  package: 'foam.nanos.export',
  name: 'GoogleSheetsExportDriver',
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
        var columnNames = X.filteredTableColumns ? X.filteredTableColumns : self.outputter.getAllPropertyNames(obj.cls_);
        stringArray.push(columnNames);
        var values = self.outputter.outputArray([ obj ], columnNames);
        stringArray = stringArray.concat(values);

        var url = await X.googleSheetsDataExport.createSheet(stringArray);
        return url;
    },
    async function exportDAO(X, dao) {
      var self = this;
      
      var sink = await dao.select();
      var url  = '';
      var stringArray = [];
      var props = X.filteredTableColumns ? X.filteredTableColumns : self.outputter.getAllPropertyNames(dao.of);
      var metadata = self.outputter.getColumnMethadata(dao.of, props);
      stringArray.push(X.filteredTableColumns ? self.outputter.getSpecifiedPropertyLabels(dao.of, X.filteredTableColumns) : self.outputter.getAllPropertyLabels(dao.of));
      var values = self.outputter.outputArray(sink.array, props);
      stringArray = stringArray.concat(values);

      url = await X.googleSheetsDataExport.createSheet(stringArray, metadata);
      return url;
    }
  ]
});