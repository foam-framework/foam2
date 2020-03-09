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
      var columnNames = X.filteredTableColumns ? X.filteredTableColumns : self.outputter.getAllPropertyNames(dao.of);
      stringArray.push(columnNames);
      var values = self.outputter.outputArray(sink.array, columnNames);
      stringArray = stringArray.concat(values);

      var url = await X.googleSheetsDataExport.createSheet(stringArray);
      return url;
    }
  ]
});