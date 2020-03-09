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
    function exportFObject(X, obj) {
      return '';
    },
    {
      name: 'exportDAO',
      code: async function(X, dao) {
        self = this;
        
        dao.select().then(function(sink) {
          var url  = '';
          var stringArray = [];
          var columnNames = X.filteredTableColumns ? X.filteredTableColumns : self.outputter.getAllPropertyNames(dao.of);
          stringArray.push(columnNames);
          var values = self.outputter.outputArray(sink.array, columnNames);
          stringArray = stringArray.concat(values);

           X.googleSheetsDataExport.createSheet(stringArray).then((val) => {
            url = val;
            if ( url && url.length > 0 ) {
              window.location.replace(url);
            }
          });
        });
      }
    }
  ]
});