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
        var props = X.filteredTableColumns ? X.filteredTableColumns : self.outputter.getAllPropertyNames(dao.of);
        var metadata = self.outputter.getColumnMethadata(dao.of, props);
        stringArray.push(metadata.map(m => m.columnLabel));
        var values = await self.outputter.outputArray([ obj ], metadata);
        stringArray = stringArray.concat(values);

        sheetId = await X.googleSheetsDataExport.createSheet(X, stringArray, metadata);
        if ( ! sheetId || sheetId.length == 0)
          return '';
        var url = `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0`;
        return url;
    },
    async function exportDAO(X, dao) {
      var self = this;
      
      var sink = await dao.select();
      var sheetId  = '';
      var stringArray = [];
      var props = X.filteredTableColumns ? X.filteredTableColumns : self.outputter.getAllPropertyNames(dao.of);
      var metadata = self.outputter.getColumnMethadata(dao.of, props);
      stringArray.push(metadata.map(m => m.columnLabel));
      var values = await self.outputter.outputArray(sink.array, metadata);
      stringArray = stringArray.concat(values);

      sheetId = await X.googleSheetsDataExport.createSheet(X, stringArray, metadata);
      if ( ! sheetId || sheetId.length == 0)
        return '';
      var url = `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0`;
      return url;
    }
  ]
});