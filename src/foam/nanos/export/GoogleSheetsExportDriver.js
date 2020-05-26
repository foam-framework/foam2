/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.export',
  name: 'GoogleSheetsExportDriver',
  implements: [ 'foam.nanos.export.ExportDriver' ],

  requires: [
    'foam.nanos.export.GoogleSheetsOutputter'
  ],

  documentation: `
    Driver retrieves data, transforms it and makes calls to googleSheetsDataExport.
    googleSheetsDataExport retrieves permission from a user to make calls to Google Sheets API on their behalf,
    creates Google Sheet, sends data to api and returns sheet id which is used for returning link to user.
  `,

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
        
        var sheetId  = '';
        var stringArray = [];
        var props = X.filteredTableColumns ? X.filteredTableColumns : self.outputter.getAllPropertyNames(obj.cls_);
        var metadata = await self.outputter.getColumnMethadata(X, obj.cls_, props);
        stringArray.push(metadata.map(m => m.columnLabel));
        var values = await self.outputter.outputArray(X, obj.cls_, [ obj ], metadata);
        stringArray = stringArray.concat(values);

        sheetId = await X.googleSheetsDataExport.createSheet(X, stringArray, metadata);
        if ( ! sheetId || sheetId.length === 0)
          return '';
        var url = `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0`;
        return url;
    },
    async function exportDAO(X, dao) {
      var self = this;
      var allColumns = dao.of.getAxiomsByClass(foam.core.Property).map(p => p.name);
    //  var filteredTableProperties = X.filteredTableColumns.map(c => allColumns.contains(c.split('.')[0]));

      var props = X.filteredTableColumns ? X.filteredTableColumns.filter(c => allColumns.includes(c.split('.')[0])) : self.outputter.getAllPropertyNames(dao.of);
      var expr = ( foam.nanos.column.ExpressionForArrayOfNestedPropertiesBuilder.create() ).buildExpr(dao.of, props);
      var metadata = await self.outputter.getColumnMethadata(X, dao.of, props);
      props = metadata.map(m => m.propName);

      var sink = await dao.select(expr);
      
      var sheetId  = '';
      var stringArray = [];

      stringArray.push(metadata.map(m => m.columnLabel));
      var values = await self.outputter.outputStringArray(X, dao.of, sink.array, metadata);
      stringArray = stringArray.concat(values);

      sheetId = await X.googleSheetsDataExport.createSheet(X, stringArray, metadata);
      if ( ! sheetId || sheetId.length == 0)
        return '';
      var url = `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0`;
      return url;
    }
  ]
});