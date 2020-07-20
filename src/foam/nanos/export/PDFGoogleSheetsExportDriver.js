/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.export',
  name: 'PDFGoogleSheetsExportDriver',

  implements: [ 
    'foam.nanos.export.ExportDriver',
    'foam.nanos.export.GoogleSheetsServiceConfig'
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
        return foam.nanos.export.GoogleSheetsOutputter.create();
      },
      hidden: true
    },
    {
      class: 'String',
      name: 'title'
    }
  ],
  methods: [
    async function exportFObject(X, obj) {
        var self = this;
        
        var sheetId  = '';
        var stringArray = [];
        var columnConfig = X.columnConfigToPropertyConverter;

        var propNames = X.filteredTableColumns ? X.filteredTableColumns : this.outputter.getAllPropertyNames(obj.cls);
        propNames = columnConfig.filterExportedProps(obj.cls_, propNames);
        
        var metadata = await self.outputter.getColumnMethadata(X, obj.cls_, propNames);
        stringArray = [ await this.outputter.objectToTable(X, obj.cls_, obj, propNames) ];

        sheetId = await X.googleSheetsDataExport.createSheet(X, stringArray, metadata, this);
        if ( ! sheetId || sheetId.length == 0)
          return '';
        var url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?exportFormat=pdf&format=pdf&scale=3`;
        return url;
    },
    async function exportDAO(X, dao) {
      var self = this;
      var columnConfig = X.columnConfigToPropertyConverter;

      var propNames = X.filteredTableColumns ? X.filteredTableColumns : this.outputter.getAllPropertyNames(dao.of);
      propNames = columnConfig.filterExportedProps(dao.of, propNames);

      var metadata = await self.outputter.getColumnMethadata(X, dao.of, propNames);

      var expr = ( foam.nanos.column.ExpressionForArrayOfNestedPropertiesBuilder.create() ).buildProjectionForPropertyNamesArray(dao.of, propNames);
      var sink = await dao.select(expr);
      
      var sheetId  = '';
      var stringArray = await self.outputter.returnTable(X, dao.of, propNames, sink.array);

      sheetId = await X.googleSheetsDataExport.createSheet(X, stringArray, metadata, this);
      if ( ! sheetId || sheetId.length == 0)
        return '';
      var url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?exportFormat=pdf&format=pdf&scale=1`;
      return url;
    }
  ],
  constants: {
    SPREADSHEET_ID_REGEX: '/spreadsheets/d/([a-zA-Z0-9-_]+)',
  }
});