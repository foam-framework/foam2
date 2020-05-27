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

  documentation: `
    Driver retrieves data, transforms it and makes calls to googleSheetsDataExport.
    googleSheetsDataExport retrieves permission from a user to make calls to Google Sheets API on their behalf,
    creates Google Sheet, sends data to api and returns sheet id which is used for returning link to user.
    Driver makes a link for downloading pdf, returns it to user and sends request to delete the sheet.
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
        var columnConfig = X.columnConfigToPropertyConverter;

        var props = X.filteredTableColumns ? X.filteredTableColumns : this.outputter.getAllPropertyNames(obj.cls);
        props = columnConfig.filterExportedProps(obj.cls_, props);
        
        var metadata = await self.outputter.getColumnMethadata(X, obj.cls_, props);
        stringArray.push(metadata.map(m => m.columnLabel));
        var values = [ await this.outputter.objToArrayOfStringValues(X, obj.cls_, [ obj ], metadata.map(p => p.propName)) ];
        stringArray = stringArray.concat(values);

        sheetId = await X.googleSheetsDataExport.createSheet(X, stringArray, metadata);
        if ( ! sheetId || sheetId.length == 0)
          return '';
        var url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?exportFormat=pdf&format=pdf&scale=3`;
        X.googleSheetsDataExport.deleteSheet(X, sheetId);
        return url;
    },
    async function exportDAO(X, dao) {
      var self = this;
      var columnConfig = X.columnConfigToPropertyConverter;

      var props = X.filteredTableColumns ? X.filteredTableColumns : this.outputter.getAllPropertyNames(dao.of);
      props = columnConfig.filterExportedProps(dao.of, props);

      var metadata = await self.outputter.getColumnMethadata(X, dao.of, props);

      var expr = ( foam.nanos.column.ExpressionForArrayOfNestedPropertiesBuilder.create() ).buildProjectionForPropertyNamesArray(dao.of, props);
      var sink = await dao.select(expr);
      
      var sheetId  = '';
      var stringArray = await self.outputter.outputTable(X, dao.of, sink.array, metadata);


      sheetId = await X.googleSheetsDataExport.createSheet(X, stringArray, metadata);
      if ( ! sheetId || sheetId.length == 0)
        return '';
      var url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?exportFormat=pdf&format=pdf&scale=3`;
      X.googleSheetsDataExport.deleteSheet(X, sheetId);
      return url;
    }
  ]
});